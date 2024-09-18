import {
  type ConnectionInfo,
  type ConnectionState,
  type EngineAbc,
  type EngineAbcConfig,
  type EngineEventMap,
  processEndpoint,
  type ProcessEndpointOptions,
} from "@tai-kun/surrealdb/engine";
import {
  CircularEngineReferenceError,
  Closed,
  ConnectionConflictError,
  ConnectionUnavailableError,
  EngineNotFoundError,
  RpcResponseError,
  SurrealTypeError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import type {
  RpcMethod,
  RpcParams,
  RpcResponse,
  RpcResult,
} from "@tai-kun/surrealdb/types";
import {
  getTimeoutSignal,
  mutex,
  type StatefulPromise,
  TaskEmitter,
  type TaskListener,
  type TaskListenerOptions,
} from "@tai-kun/surrealdb/utils";

export type CreateEngine = (config: EngineAbcConfig) =>
  | EngineAbc
  | PromiseLike<EngineAbc>;

export type ClientEngines = {
  readonly [_ in string]?: CreateEngine | string | undefined;
};

export interface ClientConfig {
  readonly engines: ClientEngines;
  readonly formatter: Formatter;
  readonly disableDefaultErrorHandler?: boolean | undefined;
}

export interface ClientConnectOptions extends ProcessEndpointOptions {
  readonly signal?: AbortSignal | undefined;
}

export interface ClientCloseOptions {
  readonly force?: boolean | undefined;
  readonly signal?: AbortSignal | undefined;
}

export interface ClientRpcOptions {
  readonly signal?: AbortSignal | undefined;
}

export default class BasicClient {
  protected readonly ee: TaskEmitter<EngineEventMap> = new TaskEmitter();
  protected readonly fmt: Formatter;
  protected eng: EngineAbc | null = null;

  private readonly _engines: ClientEngines;

  constructor(config: ClientConfig) {
    const {
      engines,
      formatter,
      disableDefaultErrorHandler,
    } = config;
    this.fmt = formatter;
    this._engines = engines;

    if (!disableDefaultErrorHandler) {
      this.ee.on("error", (_, e) => {
        if (e.fatal) {
          console.error("[@tai-kun/surrealdb]", "FATAL", e);
          this.close({ force: true }).then(null, reason => {
            console.error("[@tai-kun/surrealdb]", reason);
          });
        } else {
          console.warn("[@tai-kun/surrealdb]", "WARNING", e);
        }
      });
    }
  }

  protected async createEngine(protocol: string): Promise<EngineAbc> {
    let engine = this._engines[protocol];
    const seen: string[] = [];

    while (typeof engine === "string") {
      if (seen.includes(engine)) {
        throw new CircularEngineReferenceError(seen);
      }

      seen.push(engine);
      engine = this._engines[engine];
    }

    if (!engine) {
      throw new EngineNotFoundError(protocol);
    }

    return await engine({
      emitter: this.ee,
      formatter: this.fmt,
    });
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#state)
   */
  get state(): ConnectionState {
    return this.eng?.state ?? "closed";
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#endpoint)
   */
  get endpoint(): URL | null | undefined {
    return this.eng?.endpoint;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#namespace)
   */
  get namespace(): string | null | undefined {
    return this.eng?.namespace;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#database)
   */
  get database(): string | null | undefined {
    return this.eng?.database;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#token)
   */
  get token(): string | null | undefined {
    return this.eng?.token;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#getconnectioninfo)
   */
  getConnectionInfo(): ConnectionInfo | undefined {
    return this.eng?.getConnectionInfo();
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#on)
   */
  on<TEvent extends keyof EngineEventMap>(
    event: TEvent,
    listener: TaskListener<EngineEventMap[TEvent]>,
  ): void {
    this.ee.on(event, listener);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#off)
   */
  off<TEvent extends keyof EngineEventMap>(
    event: TEvent,
    listener: TaskListener<EngineEventMap[TEvent]>,
  ): void {
    // 誤ってすべてのイベントリスナーを解除してしまわないようにするため、
    // listener が無い場合はエラーを投げる。
    if (typeof listener !== "function") {
      throw new SurrealTypeError("Function", listener);
    }

    this.ee.off(event, listener);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#once)
   */
  once<TEvent extends keyof EngineEventMap>(
    event: TEvent,
    options?: TaskListenerOptions | undefined,
  ): StatefulPromise<EngineEventMap[TEvent]> {
    return this.ee.once(event, options);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#connect)
   */
  @mutex
  connect(
    endpoint: string | URL,
    options: ClientConnectOptions | undefined = {},
  ): Promise<void> {
    try {
      const conn = this.getConnectionInfo();
      endpoint = processEndpoint(endpoint, options);

      if (conn?.state === "open") {
        if (conn.endpoint.href === endpoint.href) {
          return Promise.resolve();
        }

        throw new ConnectionConflictError(conn.endpoint, endpoint);
      }

      if (this.eng) {
        unreachable(conn as never);
      }

      const protocol = endpoint.protocol.slice(0, -1 /* remove `:` */);
      const { signal = getTimeoutSignal(15_000) } = options;

      return (async () => {
        try {
          this.eng = await this.createEngine(protocol);
          await this.eng.connect({ endpoint, signal });
        } catch (e) {
          this.eng = null;
          throw e;
        }
      })();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#close)
   */
  @mutex
  close(options: ClientCloseOptions | undefined = {}): Promise<void> {
    if (!this.eng) {
      return Promise.resolve();
    }

    const eng = this.eng;
    this.eng = null;

    try {
      if (options.force) {
        this.ee.abort(new Closed("force close"));
      }

      return (async () => {
        try {
          await eng.close({
            signal: options.signal || getTimeoutSignal(15_000),
          });
        } finally {
          await this.ee.idle(); // エラーを投げない。
        }
      })();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async rpc<TMethod extends RpcMethod, TResult extends RpcResult<TMethod>>(
    method: TMethod,
    params: RpcParams<TMethod>,
    options: ClientRpcOptions | undefined = {},
  ): Promise<TResult> {
    const { signal = getTimeoutSignal(5_000) } = options;

    if (this.eng?.state !== "open") {
      await this.ee.once("open", { signal });
    }

    if (!this.eng) {
      throw new ConnectionUnavailableError();
    }

    return await rpc({
      engine: this.eng,
      signal,
      method,
      params,
    });
  }
}

async function rpc<
  TMethod extends RpcMethod,
  TResult extends RpcResult<TMethod>,
>(
  args: {
    readonly engine: EngineAbc;
    readonly signal: AbortSignal;
    readonly method: TMethod;
    readonly params: RpcParams<TMethod>;
  },
): Promise<TResult> {
  const resp: RpcResponse<any> = await args.engine.rpc({
    signal: args.signal,
    // @ts-expect-error
    request: {
      method: args.method,
      params: args.params,
    },
  });

  if ("result" in resp) {
    return resp.result;
  }

  throw new RpcResponseError(resp, {
    cause: {
      method: args.method,
      // TODO(tai-kun): params には機微情報が含まれている可能性があるので、method のみにしておく？
      params: args.params,
    },
  });
}
