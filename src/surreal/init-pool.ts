import type ClientBase from "@tai-kun/surrealdb/basic-client";
import type {
  ClientCloseOptions,
  ClientConfig,
} from "@tai-kun/surrealdb/basic-client";
import { SurrealValueError } from "../errors";
import { mutex } from "../utils";
import createSurql, {
  type CreateSurqlConfig,
  type Surql,
} from "./surql/create-surql";

type ClientConstructor = new(config: ClientConfig) => ClientBase;

/**
 * @experimental
 */
export interface PoolSetupOptions {
  readonly signal?: AbortSignal | undefined;
}

type Alias = { readonly [name: string]: string | URL };

/**
 * @experimental
 */
export interface PoolInit<
  TClientConstructor extends ClientConstructor,
  TAlias extends Alias,
> extends ClientConfig, CreateSurqlConfig {
  readonly Client: TClientConstructor;
  readonly alias?: TAlias | undefined;
  readonly setup?: (
    this: InstanceType<TClientConstructor>,
    endpoint: URL,
    options: PoolSetupOptions,
    alias: keyof TAlias | undefined,
  ) => PromiseLike<void>;
}

/**
 * @experimental
 */
export type PoolSurreal<TClientConstructor extends ClientConstructor> =
  & InstanceType<TClientConstructor>
  & Disposable
  & { disconnect(options?: ClientCloseOptions | undefined): void };

type Endpoint<TAlias extends Alias> = Extract<keyof TAlias, string>;

/**
 * @experimental
 */
export interface PoolInstance<
  TClientConstructor extends ClientConstructor,
  TAlias extends Alias,
> extends AsyncDisposable {
  get(
    endpoint: Endpoint<TAlias> | URL,
    options?: PoolSetupOptions | undefined,
  ): Promise<PoolSurreal<TClientConstructor>>;
  close(
    endpoint: Endpoint<TAlias> | URL,
    options?: ClientCloseOptions | undefined,
  ): Promise<void>;
  closeAll(options?: ClientCloseOptions | undefined): Promise<void>;
}

/**
 * @experimental
 */
export interface PoolOptions<
  TClientConstructor extends ClientConstructor,
  TAlias extends Alias,
> {
  readonly alias?: TAlias | undefined;
  readonly setup?: PoolInit<TClientConstructor, TAlias>["setup"];
  readonly closeDelay?: number | undefined;
}

/**
 * @experimental
 */
export interface InitializedPool<
  TClientConstructor extends ClientConstructor,
  TAlias extends Alias,
> {
  Pool: new<const TPoolAlias extends Alias = {}>(
    options?: PoolOptions<TClientConstructor, TPoolAlias> | undefined,
  ) => PoolInstance<
    TClientConstructor,
    Omit<TAlias, keyof TPoolAlias> & TPoolAlias
  >;
  surql: Surql;
}

/**
 * @experimental
 */
export default function initPool<
  TClientConstructor extends ClientConstructor,
  const TAlias extends Alias = {},
>(
  init: PoolInit<TClientConstructor, TAlias>,
): InitializedPool<TClientConstructor, TAlias> {
  const {
    alias,
    setup = async function(endpoint, options) {
      if (this.state === "open") {
        return;
      }

      await this.connect(endpoint, options);
    },
    Client,
    formatter,
    varPrefix,
    ...others
  } = init;

  // @ts-expect-error
  class Surreal extends Client implements Disposable {
    constructor(private dispose: () => void) {
      super({
        formatter,
        ...others,
      });
    }

    disconnect(): void {
      this.dispose();
    }

    [Symbol.dispose || Symbol.for("Symbol.dispose")](): void {
      this.disconnect();
    }
  }

  // @ts-expect-error
  class Pool implements PoolInstance<ClientConstructor, Alias> {
    private map = new Map<string, [
      number,
      PoolSurreal<ClientConstructor>,
      ReturnType<typeof setTimeout>?,
    ]>();

    private closing = new Set<
      (options: ClientCloseOptions | undefined) => Promise<void>
    >();

    private setup: NonNullable<PoolInit<ClientConstructor, Alias>["setup"]>;

    private alias: Alias;

    private closeDelay: number;

    constructor(
      options: PoolOptions<ClientConstructor, Alias> | undefined = {},
    ) {
      this.setup = (options.setup || setup) as NonNullable<
        PoolInit<ClientConstructor, Alias>["setup"]
      >;
      this.alias = { ...alias, ...options.alias };
      this.closeDelay = Math.max(0, options.closeDelay ?? 30e3);
    }

    private getUrl(endpoint: Endpoint<Alias> | URL): URL | undefined {
      if (typeof endpoint === "string") {
        return this.alias[endpoint] === undefined
          ? undefined
          : new URL(this.alias[endpoint]);
      }

      return new URL(endpoint); // copy
    }

    private getKey(endpoint: Endpoint<Alias> | URL): string | undefined {
      return this.getUrl(endpoint)?.toString();
    }

    @mutex
    async get(
      endpoint: Endpoint<Alias> | URL,
      options: PoolSetupOptions | undefined = {},
    ): Promise<PoolSurreal<ClientConstructor>> {
      const url = this.getUrl(endpoint);
      const alias = typeof endpoint === "string" ? endpoint : undefined;

      if (!url) {
        throw new SurrealValueError("predefined endpoint", url, {
          cause: {
            alias,
          },
        });
      }

      const key = url.toString();

      if (this.map.has(key)) {
        const val = this.map.get(key)!;
        clearTimeout(val[2]);
        delete val[2];
        const db = val[1];
        await this.setup.call(db, url, options, alias);
        val[0] += 1;

        return db;
      }

      const db = new Surreal(() => {
        const val = this.map.get(key);

        if (!val) {
          return;
        }

        val[0] -= 1;

        if (val[0] > 0 || 2 in val) {
          return;
        }

        let promise: Promise<void> | undefined;
        const close = async (options?: ClientCloseOptions | undefined) => {
          clearTimeout(val[2]);
          this.map.delete(key);
          promise ||= (async () => {
            try {
              await val[1].close(options);
            } catch (e) {
              // TODO(tai-kun): TaskEmitter を使って利用者がエラーを受け取れるようにする。
              console.error(e);
            } finally {
              this.closing.delete(close);
            }
          })();

          return promise;
        };
        val[2] = setTimeout(close, this.closeDelay);
        this.closing.add(close);
      }) as unknown as PoolSurreal<ClientConstructor>;
      await this.setup.call(db, url, options, alias);
      this.map.set(key, [1, db]);

      return db;
    }

    @mutex
    async close(
      endpoint: Endpoint<Alias> | URL,
      options?: ClientCloseOptions | undefined,
    ): Promise<void> {
      const key = this.getKey(endpoint);
      const val = this.map.get(key!);

      if (!val) {
        return;
      }

      const [, db] = val;

      if (db.state === "closed" || db.state === "closing") {
        return;
      }

      await db.close(options);
    }

    @mutex
    async closeAll(options?: ClientCloseOptions | undefined): Promise<void> {
      for (const [, db] of this.map.values()) {
        db.disconnect();
      }

      await Promise.all([...this.closing].map(async close => {
        await close(options);
      }));
    }

    async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]() {
      await this.closeAll();
    }
  }

  return {
    // @ts-expect-error
    Pool,
    surql: createSurql({
      formatter,
      varPrefix,
    }),
  };
}
