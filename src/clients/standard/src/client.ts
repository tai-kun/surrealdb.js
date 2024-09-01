import Base, { type ClientRpcOptions } from "@tai-kun/surrealdb/clients/basic";
import { QueryFailedError } from "@tai-kun/surrealdb/errors";
import type {
  Auth,
  LiveData,
  LiveDiff,
  LiveResult,
  Patch,
  PreparedQueryLike,
  QueryResult,
  ReadonlyPatch,
  RecordAccessAuth,
  RpcResultMapping,
  SlotLike,
} from "@tai-kun/surrealdb/types";
import type { TaskListener } from "@tai-kun/surrealdb/utils";
import type { IsLiteral, Simplify, UnionToIntersection } from "type-fest";
import type { DataType } from "~/surreal/src/data-types";
import Jwt from "./jwt";

// re-exports
export type * from "@tai-kun/surrealdb/clients/basic";

type Override<T, U> = Simplify<Omit<T, keyof U> & U>;

export type InferSlotVars<T extends SlotLike> = UnionToIntersection<
  // dprint-ignore
  {
    [N in T["name"]]: T extends SlotLike<N, infer R, infer V>
      ? R extends false
      ? { readonly [_ in N]?: V }
      : { readonly [_ in N]:  V } // boolean の場合も必須で。
      : never;
  }[T["name"]]
>;

export interface LiveOptions extends ClientRpcOptions {
  readonly diff?: boolean | undefined;
}

export type LiveHandler<T extends LiveResult<any, any> = LiveResult> =
  TaskListener<[response: T]>;

export type InferLiveResult<
  I extends string | object,
  T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
  P extends Patch[] = Patch[],
> = I extends { __diff: true } ? LiveDiff<T, P>
  : I extends { __diff: false } ? LiveData<T>
  : LiveResult<T, P>;

export type ActionResult<
  T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
> = [Extract<keyof T, "id">] extends [never]
  ? IsLiteral<keyof T> extends true
    ? Simplify<{ id: string | DataType.Thing } & T>
  : ({ id: string | DataType.Thing } & T)
  : T;

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

  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | object,
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<T & { __diff: true }>;

  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | object,
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<T & { __diff: false }>;

  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | object,
    options?: LiveOptions | undefined,
  ): Promise<T & { __diff: boolean }>;

  // TODO(tai-kun): バッファリングオプションを追加
  async live(
    table: string | object,
    options: LiveOptions | undefined = {},
  ) {
    const { diff, ...rest } = options;
    const queryUuid = await this.rpc("live", [table, diff], rest);

    return queryUuid;
  }

  subscribe<
    I extends string | object,
    T extends InferLiveResult<I, any, any> = InferLiveResult<I>,
  >(
    queryUuid: I,
    callback: LiveHandler<T>,
  ): void {
    this.ee.on(`live_${queryUuid}`, callback as LiveHandler<any>);
  }

  unsubscribe(
    queryUuid: string | object,
    callback: LiveHandler<any>,
  ): void {
    this.ee.off(`live_${queryUuid}`, callback);
  }

  async kill(
    queryUuid: string | object | readonly (string | object)[],
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
  async queryRaw<T extends readonly QueryResult[] = QueryResult[]>(
    surql: string | PreparedQueryLike,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    const results: readonly QueryResult[] = await this.rpc(
      "query",
      [surql, vars],
      options,
    );

    return results as T;
  }

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/querying/#query)
   */
  async query<T extends readonly unknown[] = unknown[]>(
    surql: string,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/querying/#query)
   */
  async query<T>(
    surql: Override<PreparedQueryLike, {
      readonly slots: readonly (never | SlotLike<string, false>)[];
      readonly __type: T;
    }>,
    vars?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  /**
   * [API Reference](https://tai-kun.github.io/surrealdb.js/guides/querying/#query)
   */
  async query<S extends SlotLike, T>(
    surql: Override<PreparedQueryLike, {
      readonly slots: readonly S[];
      readonly __type: T;
    }>,
    vars: Simplify<InferSlotVars<S> & { readonly [p: string]: unknown }>,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

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
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
  >(
    table: DataType.Table | string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async select<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
  >(
    thing: DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async select(
    target:
      | (DataType.Table | string)
      | DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("select", [target], options);
  }

  async create<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    table: DataType.Table | string,
    content?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async create<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    thing: DataType.Thing,
    content?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

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
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    table: DataType.Table | string,
    data?: U | readonly U[] | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

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
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    table: DataType.Table | string,
    content?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async update<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    thing: DataType.Thing,
    content?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

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
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    table: DataType.Table | string,
    content?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async upsert<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    thing: DataType.Thing,
    content?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

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
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    table: DataType.Table | string,
    data: U,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async merge<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    thing: DataType.Thing,
    data: U,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

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
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
  >(
    table: DataType.Table | string,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<ActionResult<T>[]>;

  async patch<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
  >(
    thing: DataType.Thing,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<ActionResult<T>>;

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
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
  >(
    table: DataType.Table | string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async delete<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
  >(
    thing: DataType.Thing,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

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
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    from: string | object | readonly object[],
    thing: string,
    to: string | object | readonly object[],
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T[]>;

  async relate<
    T extends { readonly [p: string]: unknown } = { [p: string]: unknown },
    U extends { readonly [p: string]: unknown } = T,
  >(
    from: string | object | readonly object[],
    thing: object,
    to: string | object | readonly object[],
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  async relate(
    from: string | object | readonly object[],
    thing: string | object,
    to: string | object | readonly object[],
    data?: { readonly [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("relate", [from, thing, to, data], options);
  }
}
