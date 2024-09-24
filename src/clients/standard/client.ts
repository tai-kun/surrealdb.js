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
  RpcGraphqlRequest,
  RpcResultMapping,
  SlotLike,
} from "@tai-kun/surrealdb/types";
import { isTable, type TaskListener } from "@tai-kun/surrealdb/utils";
import type { Simplify, UnionToIntersection } from "type-fest";
import type { DataType } from "../../surreal/data-types";
import Jwt from "./jwt";

// re-exports
export type * from "@tai-kun/surrealdb/clients/basic";

type Override<T, U> = Simplify<Omit<T, keyof U> & U>;

export type InferSlotVars<TSlot extends SlotLike> = UnionToIntersection<
  // dprint-ignore
  {
    [TName in TSlot["name"]]:
      TSlot extends SlotLike<TName, infer TRequired, infer TValue>
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
  TUuid,
  TData extends Readonly<RecordData> = RecordData,
  TPatch extends Patch[] = Patch[],
> = TUuid extends { __diff: false }
  ? LivePayload.Data<TData, DataType.Thing | string>
  : TUuid extends { __diff: true }
    ? LivePayload.Diff<TData, TPatch, DataType.Thing | string>
  : LivePayload<TData, TPatch>;

export type ActionResult<
  TData extends Readonly<RecordData> = RecordData,
> = [Extract<keyof TData, "id">] extends [never]
  ? ({ id: DataType.Thing | string } & TData)
  : TData;

type _In<T> = [Extract<keyof T, "in">] extends [never]
  ? ({ in: DataType.Thing | string } & T)
  : T;

type _Out<T> = [Extract<keyof T, "out">] extends [never]
  ? ({ out: DataType.Thing | string } & T)
  : T;

export type RelateResult<
  TData extends Readonly<RecordData> = RecordData,
> = ActionResult<_In<_Out<TData>>>;

export interface PatchOptions extends ClientRpcOptions {
  readonly diff?: boolean | undefined;
}

export interface RunOptions extends ClientRpcOptions {
  readonly version?: string | undefined;
}

export interface GraphqlOptions
  extends ClientRpcOptions, NonNullable<RpcGraphqlRequest["params"][1]>
{}

type RecordData = {
  [p: string]: unknown;
};

// DEFINE TABLE ... TYPE NORMAL
type NormalRecord = {
  id: DataType.Thing | string;
  // RecordData
  [p: string]: unknown;
};

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
   * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/connecting/#signup)
   */
  async signup(
    auth: RecordAccessAuth,
    options?: ClientRpcOptions | undefined,
  ): Promise<Jwt> {
    return new Jwt(await this.rpc("signup", [auth], options));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/connecting/#signin)
   */
  async signin(
    auth: Auth,
    options?: ClientRpcOptions | undefined,
  ): Promise<Jwt> {
    return new Jwt(await this.rpc("signin", [auth], options));
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/connecting/#authenticate)
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
   * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/connecting/#invalidate)
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
    TUuid,
    TPayload extends LivePayload<any, any> = InferLivePayload<TUuid>,
  >(
    queryUuid: TUuid,
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
   * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/querying/#queryraw)
   */
  async queryRaw<TResults extends readonly QueryResult[] = QueryResult[]>(
    surql: string | PreparedQueryLike,
    vars?: Readonly<RecordData> | undefined,
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
   * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/querying/#query)
   */
  async query<TReturns extends readonly unknown[] = unknown[]>(
    surql: string,
    vars?: Readonly<RecordData> | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<TReturns>;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/querying/#query)
   */
  async query<TResult>(
    surql: Override<PreparedQueryLike, {
      readonly slots: readonly SlotLike<any, false, any>[];
      readonly __type: TResult;
    }>,
    vars?: Readonly<RecordData> | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<TResult>;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/querying/#query)
   */
  async query<TSlot extends SlotLike, TResult>(
    surql: Override<PreparedQueryLike, {
      readonly slots: readonly TSlot[];
      readonly __type: TResult;
    }>,
    vars: Simplify<InferSlotVars<TSlot>> & Readonly<RecordData>,
    options?: ClientRpcOptions | undefined,
  ): Promise<TResult>;

  async query(
    surql: string | PreparedQueryLike,
    vars?: Readonly<RecordData> | undefined,
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
    TResult extends Readonly<RecordData> = RecordData,
  >(
    table: DataType.Table | string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async select<
    TResult extends Readonly<RecordData> = RecordData,
  >(
    thing: DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>>;

  async select(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("select", [target], options);
  }

  async create<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    table: DataType.Table | string,
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>>;

  async create<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    thing: DataType.Thing,
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>>;

  async create(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    data?: Readonly<RecordData> | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("create", [target, data], options);
  }

  async insert<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    table: DataType.Table | string,
    data?: TData | readonly TData[] | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async insert<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<NormalRecord> = (
      TResult extends { readonly id: any } ? TResult
        : ({ id: DataType.Thing | string } & TResult)
    ),
  >(
    table: DataType.Table | string | null | undefined,
    data?: TData | readonly TData[] | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async insert<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<NormalRecord> = (
      TResult extends { readonly id: any } ? TResult
        : ({ id: DataType.Thing | string } & TResult)
    ),
  >(
    data: TData | readonly TData[],
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async insert(
    ...args:
      | [
        table: DataType.Table | string | null | undefined,
        data?:
          | Readonly<RecordData>
          | readonly Readonly<RecordData>[]
          | undefined,
        options?: ClientRpcOptions | undefined,
      ]
      | [
        data: Readonly<NormalRecord> | readonly Readonly<NormalRecord>[],
        options?: ClientRpcOptions | undefined,
      ]
  ) {
    const [table, data, options]: [any?, any?, any?] =
      isTable<DataType.Table>(args[0])
        || typeof args[0] === "string"
        || typeof args[0] == null
        ? args
        : [null, args[0], args[1]];

    return await this.rpc("insert", [table, data], options);
  }

  async insert_relation<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    table: DataType.Table | string,
    data?: TData | readonly TData[] | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<RelateResult<TResult>[]>;

  async insert_relation<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<NormalRecord> = (
      TResult extends { readonly id: any } ? TResult
        : ({ id: DataType.Thing | string } & TResult)
    ),
  >(
    table: DataType.Table | string | null | undefined,
    data?: TData | readonly TData[] | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<RelateResult<TResult>[]>;

  async insert_relation<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<NormalRecord> = (
      TResult extends { readonly id: any } ? TResult
        : ({ id: DataType.Thing | string } & TResult)
    ),
  >(
    data: TData | readonly TData[],
    options?: ClientRpcOptions | undefined,
  ): Promise<RelateResult<TResult>[]>;

  async insert_relation(
    ...args:
      | [
        table: DataType.Table | string | null | undefined,
        data?:
          | Readonly<RecordData>
          | readonly Readonly<RecordData>[]
          | undefined,
        options?: ClientRpcOptions | undefined,
      ]
      | [
        data: Readonly<NormalRecord> | readonly Readonly<NormalRecord>[],
        options?: ClientRpcOptions | undefined,
      ]
  ) {
    const [table, data, options]: [any?, any?, any?] =
      isTable<DataType.Table>(args[0])
        || typeof args[0] === "string"
        || typeof args[0] == null
        ? args
        : [null, args[0], args[1]];

    return await this.rpc("insert_relation", [table, data], options);
  }

  async update<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    table: DataType.Table | string,
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async update<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    thing: DataType.Thing,
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>>;

  async update(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    data?: Readonly<RecordData> | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("update", [target, data], options);
  }

  async upsert<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    table: DataType.Table | string,
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async upsert<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    thing: DataType.Thing,
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>>;

  async upsert(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    data?: Readonly<RecordData> | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("upsert", [target, data], options);
  }

  async merge<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    table: DataType.Table | string,
    data: TData,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async merge<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    thing: DataType.Thing,
    data: TData,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>>;

  async merge(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    data: Readonly<RecordData>,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("merge", [target, data], options);
  }

  async patch<
    TResult extends Readonly<RecordData> = RecordData,
  >(
    table: DataType.Table | string,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async patch<
    TResult extends Readonly<RecordData> = RecordData,
  >(
    thing: DataType.Thing,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<ActionResult<TResult>>;

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
    TResult extends Readonly<RecordData> = RecordData,
  >(
    table: DataType.Table | string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>[]>;

  async delete<
    TResult extends Readonly<RecordData> = RecordData,
  >(
    thing: DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<TResult>>;

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

  /**
   * @experimental
   */
  async graphql(
    // `vars` of `variables`
    // `operation` or `operationName`
    query: string | {
      readonly query: string;
      readonly vars?: Readonly<RecordData> | undefined;
      readonly operation?: string | undefined;
    } | {
      readonly query: string;
      readonly vars?: Readonly<RecordData> | undefined;
      readonly operationName?: string | undefined;
    } | {
      readonly query: string;
      readonly variables?: Readonly<RecordData> | undefined;
      readonly operation?: string | undefined;
    } | {
      readonly query: string;
      readonly variables?: Readonly<RecordData> | undefined;
      readonly operationName?: string | undefined;
    },
    options: GraphqlOptions | undefined = {},
  ): Promise<string> {
    const { signal, ...gqlOptions } = options;

    return await this.rpc("graphql", [query, gqlOptions], { signal });
  }

  async relate<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    from: DataType.Thing | string | readonly (DataType.Thing | string)[],
    thing: string,
    to: DataType.Thing | string | readonly (DataType.Thing | string)[],
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<RelateResult<TResult>[]>;

  async relate<
    TResult extends Readonly<RecordData> = RecordData,
    TData extends Readonly<RecordData> = TResult,
  >(
    from: DataType.Thing | string | readonly (DataType.Thing | string)[],
    thing: DataType.Thing,
    to: DataType.Thing | string | readonly (DataType.Thing | string)[],
    data?: TData | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<RelateResult<TResult>>;

  async relate(
    from: DataType.Thing | string | readonly (DataType.Thing | string)[],
    thing: DataType.Thing | string,
    to: DataType.Thing | string | readonly (DataType.Thing | string)[],
    data?: Readonly<RecordData> | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("relate", [from, thing, to, data], options);
  }
}
