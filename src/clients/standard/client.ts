import Base, { type ClientRpcOptions } from "@tai-kun/surrealdb/clients/basic";
import { QueryFailedError } from "@tai-kun/surrealdb/errors";
import type {
  Auth,
  LivePayload,
  Patch,
  PreparedQueryLike,
  QueryResult,
  ReadonlyPatch,
  RecordAccessAuth,
  RpcResultMapping,
  SlotLike,
} from "@tai-kun/surrealdb/types";
import type { TaskListener } from "@tai-kun/surrealdb/utils";
import type { Simplify, UnionToIntersection } from "type-fest";
import type { DataType } from "../../surreal/data-types";
import Jwt from "./jwt";

// re-exports
export type * from "@tai-kun/surrealdb/clients/basic";

type Override<T, U> = Simplify<Omit<T, keyof U> & U>;

export type InferSlotVars<TSlot extends SlotLike> = UnionToIntersection<
  // dprint-ignore
  {
    [TName in TSlot["name"]]: TSlot extends SlotLike<TName, infer TRequired, infer TValue>
      ? TRequired extends false
      ? { readonly [_ in TName]?: TValue }
      : { readonly [_ in TName]:  TValue } // boolean の場合も必須で。
      : never;
  }[TSlot["name"]]
>;

export interface LiveOptions extends ClientRpcOptions {
  readonly diff?: boolean | undefined;
}

export type LiveHandler<TPayload extends LivePayload<any, any> = LivePayload> =
  TaskListener<[payload: TPayload]>;

export type InferLivePayload<
  IUuid,
  TRecord extends { readonly [p: string]: unknown } = { [p: string]: unknown },
  TPatch extends Patch[] = Patch[],
> = IUuid extends { __diff: false }
  ? LivePayload.Data<TRecord, string | DataType.Thing>
  : IUuid extends { __diff: true }
    ? LivePayload.Diff<TRecord, TPatch, string | DataType.Thing>
  : LivePayload<TRecord, TPatch>;

export type ActionResult<
  TRecord extends { readonly [p: string]: unknown } = { [p: string]: unknown },
> = [Extract<keyof TRecord, "id">] extends [never]
  ? ({ id: string | DataType.Thing } & TRecord)
  : TRecord;

export interface PatchOptions extends ClientRpcOptions {
  readonly diff?: boolean | undefined;
}

export interface RunOptions extends ClientRpcOptions {
  readonly version?: string | undefined;
}

export default class Client extends Base {
  async ping(options?: ClientRpcOptions | undefined): Promise<void> {
    await this.rpc("ping", [], options);
  }

  async use(
    ns: string | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  async use(
    ns: string | null | undefined,
    db?: string | null | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  async use(
    target: [ns: string | null | undefined, db?: string | null | undefined],
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  async use(
    target: {
      readonly ns?: string | null | undefined;
      readonly db?: string | null | undefined;
    },
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  async use(
    target: {
      readonly namespace?: string | null | undefined;
      readonly database?: string | null | undefined;
    },
    options?: ClientRpcOptions | undefined,
  ): Promise<void>;

  async use(
    ...args:
      | [
        string | null | undefined,
        (ClientRpcOptions | undefined)?,
      ]
      | [
        string | null | undefined,
        (string | null | undefined)?,
        (ClientRpcOptions | undefined)?,
      ]
      | [
        [string | null | undefined, (string | null | undefined)?],
        (ClientRpcOptions | undefined)?,
      ]
      | [
        {
          readonly ns?: string | null | undefined;
          readonly db?: string | null | undefined;
        },
        (ClientRpcOptions | undefined)?,
      ]
      | [
        {
          readonly namespace?: string | null | undefined;
          readonly database?: string | null | undefined;
        },
        (ClientRpcOptions | undefined)?,
      ]
  ): Promise<void> {
    let namespace: string | null | undefined;
    let database: string | null | undefined;
    let options: ClientRpcOptions | undefined;

    if (typeof args[0] === "string" || args[0] == null) {
      const [ns, arg1, arg2] = args;
      const [db, opts] = typeof arg1 === "string" || arg1 == null
        ? [arg1, arg2]
        : [undefined, arg2];
      namespace = ns;
      database = db;
      options = opts;
    } else if (Array.isArray(args[0])) {
      const [[ns, db], opts] = args;
      namespace = ns;
      database = db;
      options = opts as ClientRpcOptions | undefined;
    } else if ("ns" in args[0] || "db" in args[0]) {
      const [{ ns, db }, opts] = args;
      namespace = ns;
      database = db;
      options = opts as ClientRpcOptions | undefined;
    } else if ("namespace" in args[0] || "database" in args[0]) {
      const [{ namespace: ns, database: db }, opts] = args;
      namespace = ns;
      database = db;
      options = opts as ClientRpcOptions | undefined;
    }

    await this.rpc("use", [namespace, database], options);
  }

  async info<T extends RpcResultMapping["info"] = RpcResultMapping["info"]>(
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("info", [], options);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#signup)
   */
  async signup(
    auth: RecordAccessAuth,
    options?: ClientRpcOptions | undefined,
  ): Promise<Jwt> {
    return new Jwt(await this.rpc("signup", [auth], options));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#signin)
   */
  async signin(
    auth: Auth,
    options?: ClientRpcOptions | undefined,
  ): Promise<Jwt> {
    return new Jwt(await this.rpc("signin", [auth], options));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#authenticate)
   */
  async authenticate(
    token: string | Jwt,
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    if (typeof token !== "string") {
      token = token.raw;
    }

    await this.rpc("authenticate", [token], options);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/connecting/#invalidate)
   */
  async invalidate(
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("invalidate", [], options);
  }

  async live<T extends DataType.Uuid | string = DataType.Uuid | string>(
    table: DataType.Table | string,
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<T & { __diff: true }>;

  async live<T extends DataType.Uuid | string = DataType.Uuid | string>(
    table: DataType.Table | string,
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<T & { __diff: false }>;

  async live<T extends DataType.Uuid | string = DataType.Uuid | string>(
    table: DataType.Table | string,
    options?: LiveOptions | undefined,
  ): Promise<T & { __diff: boolean }>;

  // TODO(tai-kun): バッファリングオプションを追加
  async live(
    table: DataType.Table | string,
    options: LiveOptions | undefined = {},
  ) {
    const { diff, ...rest } = options;
    const queryUuid = await this.rpc("live", [table, diff], rest);

    return queryUuid;
  }

  subscribe<
    IUuid,
    TPayload extends LivePayload<any, any> = InferLivePayload<IUuid>,
  >(
    queryUuid: IUuid,
    callback: LiveHandler<TPayload>,
  ): void {
    this.ee.on(`live_${queryUuid}`, callback as LiveHandler<any>);
  }

  unsubscribe(
    queryUuid: DataType.Uuid | string,
    callback: LiveHandler<any>,
  ): void {
    this.ee.off(`live_${queryUuid}`, callback);
  }

  async kill(
    queryUuid: DataType.Uuid | string | readonly (DataType.Uuid | string)[],
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    if (Array.isArray(queryUuid)) {
      await Promise.all(queryUuid.map(async uuid => {
        await this.kill(uuid, options);
      }));
    } else {
      this.ee.off(`live_${queryUuid}`);
      await this.rpc("kill", [queryUuid], options);
    }
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/querying/#queryraw)
   */
  async queryRaw<TResults extends readonly QueryResult[] = QueryResult[]>(
    surql: string | PreparedQueryLike,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<TResults> {
    const results: readonly QueryResult[] = await this.rpc(
      "query",
      [surql, vars],
      options,
    );

    return results as TResults;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/querying/#query)
   */
  async query<TReturns extends readonly unknown[] = unknown[]>(
    surql: string,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<TReturns>;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/querying/#query)
   */
  async query<TResult>(
    surql: Override<PreparedQueryLike, {
      readonly slots: readonly (never | SlotLike<string, false>)[];
      readonly __type: TResult;
    }>,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<TResult>;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/querying/#query)
   */
  async query<TSlot extends SlotLike, TResult>(
    surql: Override<PreparedQueryLike, {
      readonly slots: readonly TSlot[];
      readonly __type: TResult;
    }>,
    vars: Simplify<InferSlotVars<TSlot> & { readonly [p: string]: unknown }>,
    options?: ClientRpcOptions | undefined,
  ): Promise<TResult>;

  async query(
    surql: string | PreparedQueryLike,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<unknown> {
    const results = await this.queryRaw(surql, vars, options);
    const output: unknown[] = [];
    const errors: string[] = [];

    for (const result of results) {
      if (result.status === "OK") {
        output.push(result.result);
      } else {
        errors.push(result.result);
      }
    }

    if (errors.length > 0) {
      throw new QueryFailedError(errors);
    }

    if (typeof surql === "string") {
      return output;
    }

    return surql._trans(surql._parse(output));
  }

  async let(
    name: string,
    value: unknown,
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("let", [name, value], options);
  }

  async unset(
    name: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("unset", [name], options);
  }

  async select<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
  >(
    table: DataType.Table | string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>[]>;

  async select<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
  >(
    thing: DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>>;

  async select(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("select", [target], options);
  }

  async create<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TContent extends { readonly [p: string]: unknown } = TRecord,
  >(
    table: DataType.Table | string,
    content?: TContent | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>>;

  async create<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TContent extends { readonly [p: string]: unknown } = TRecord,
  >(
    thing: DataType.Thing,
    content?: TContent | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>>;

  async create(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    content?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("create", [target, content], options);
  }

  async insert<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TData extends { readonly [p: string]: unknown } = TRecord,
  >(
    table: DataType.Table | string,
    data?: TData | readonly TData[] | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>[]>;

  async insert(
    target: DataType.Table | string,
    data?:
      | { readonly [p: string]: unknown }
      | readonly { readonly [p: string]: unknown }[]
      | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("insert", [target, data], options);
  }

  async update<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TContent extends { readonly [p: string]: unknown } = TRecord,
  >(
    table: DataType.Table | string,
    content?: TContent | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>[]>;

  async update<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TContent extends { readonly [p: string]: unknown } = TRecord,
  >(
    thing: DataType.Thing,
    content?: TContent | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>>;

  async update(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    content?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("update", [target, content], options);
  }

  async upsert<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TContent extends { readonly [p: string]: unknown } = TRecord,
  >(
    table: DataType.Table | string,
    content?: TContent | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>[]>;

  async upsert<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TContent extends { readonly [p: string]: unknown } = TRecord,
  >(
    thing: DataType.Thing,
    content?: TContent | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>>;

  async upsert(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    content?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("upsert", [target, content], options);
  }

  async merge<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TData extends { readonly [p: string]: unknown } = TRecord,
  >(
    table: DataType.Table | string,
    data: TData,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>[]>;

  async merge<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TData extends { readonly [p: string]: unknown } = TRecord,
  >(
    thing: DataType.Thing,
    data: TData,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>>;

  async merge(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    data: { readonly [p: string]: unknown },
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("merge", [target, data], options);
  }

  async patch<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
  >(
    table: DataType.Table | string,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<ActionResult<TRecord>[]>;

  async patch<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
  >(
    thing: DataType.Thing,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<ActionResult<TRecord>>;

  async patch(
    table: DataType.Table | string,
    patches: readonly ReadonlyPatch[],
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<Patch[][]>;

  async patch(
    thing: DataType.Thing,
    patches: readonly ReadonlyPatch[],
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<Patch[]>;

  async patch(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    patches: readonly ReadonlyPatch[],
    options?: PatchOptions | undefined,
  ) {
    const { diff, ...rest } = options || {};

    return await this.rpc("patch", [target, patches, diff], rest);
  }

  async delete<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
  >(
    table: DataType.Table | string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>[]>;

  async delete<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
  >(
    thing: DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TRecord>>;

  async delete(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("delete", [target], options);
  }

  async version(options?: ClientRpcOptions | undefined): Promise<string> {
    return await this.rpc("version", [], options);
  }

  async run<T = unknown>(
    funcName: string,
    options?: RunOptions | undefined,
  ): Promise<T>;

  async run<T = unknown>(
    funcName: string,
    args?: readonly unknown[] | undefined,
    options?: RunOptions | undefined,
  ): Promise<T>;

  async run(
    funcName: string,
    arg1?: readonly unknown[] | RunOptions | undefined,
    arg2?: RunOptions | undefined,
  ) {
    const [args, opts] = Array.isArray(arg1) || arg1 === undefined
      ? [arg1, arg2] as const
      : [, arg1] as const;
    const { version, ...rest } = opts || {};

    return await this.rpc("run", [funcName, version, args], rest);
  }

  async relate<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TData extends { readonly [p: string]: unknown } = TRecord,
  >(
    from: DataType.Thing | string | readonly (DataType.Thing | string)[],
    thing: string,
    to: DataType.Thing | string | readonly (DataType.Thing | string)[],
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<TRecord[]>;

  async relate<
    TRecord extends { readonly [p: string]: unknown } = {
      [p: string]: unknown;
    },
    TData extends { readonly [p: string]: unknown } = TRecord,
  >(
    from: DataType.Thing | string | readonly (DataType.Thing | string)[],
    thing: DataType.Thing,
    to: DataType.Thing | string | readonly (DataType.Thing | string)[],
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<TRecord>;

  async relate(
    from: DataType.Thing | string | readonly (DataType.Thing | string)[],
    thing: DataType.Thing | string,
    to: DataType.Thing | string | readonly (DataType.Thing | string)[],
    data?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("relate", [from, thing, to, data], options);
  }
}
