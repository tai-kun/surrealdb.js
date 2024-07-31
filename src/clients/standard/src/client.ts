import type { ClientRpcOptions } from "@tai-kun/surrealdb/client";
import Base from "@tai-kun/surrealdb/clients/basic";
import { QueryFailedError } from "@tai-kun/surrealdb/errors";
import type {
  AccessAuth,
  LiveData,
  LiveDiff,
  LiveResult,
  Patch,
  QueryResult,
  ReadonlyPatch,
  RecordAccessAuth,
  RpcResultMapping,
} from "@tai-kun/surrealdb/types";
import type { TaskListener } from "@tai-kun/surrealdb/utils";

export interface LiveOptions extends ClientRpcOptions {
  readonly diff?: boolean | undefined;
}

export type LiveHandler<T extends LiveResult<any, any> = LiveResult> =
  TaskListener<[response: T]>;

// dprint-ignore
export type InferLiveResult<
  I extends string | object,
  T extends Record<string, unknown> = Record<string, unknown>,
  P extends Patch[] = Patch[]
>
  = I extends { __diff: true }  ? LiveDiff<T, P>
  : I extends { __diff: false } ? LiveData<T>
  : LiveResult<T, P>

type Simplify<T> = { [P in keyof T]: T[P] } & {};

// dprint-ignore
export type ActionResult<T extends { [p: string]: unknown } = { [p: string]: unknown }>
  = "id" extends keyof T ? T
  : Simplify<T & { readonly id: string | object }>;

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
      const [db, opts] = typeof arg1 === "string"
        ? [arg1, arg2]
        : [null, arg1 || arg2];
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

  async signup<
    T extends RpcResultMapping["signup"] = RpcResultMapping["signup"],
  >(
    auth: RecordAccessAuth,
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("signup", [auth], options);
  }

  async signin<
    T extends RpcResultMapping["signin"] = RpcResultMapping["signin"],
  >(
    auth: AccessAuth,
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("signin", [auth], options);
  }

  async authenticate(
    token: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("authenticate", [token], options);
  }

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

  async queryRaw<T extends readonly QueryResult[] = QueryResult[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: { readonly [p: string]: unknown } | undefined;
    },
    vars?: { [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T> {
    const results: readonly QueryResult[] = await this.rpc(
      "query",
      [surql, vars],
      options,
    );

    return results as T;
  }

  async query<T extends readonly unknown[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: { [p: string]: unknown } | undefined;
      readonly __type: T;
    },
    vars?: { [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  async query<T extends readonly unknown[] = unknown[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: { [p: string]: unknown } | undefined;
    },
    vars?: { [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T>;

  async query(
    surql: string | {
      readonly text: string;
      readonly vars?: { [p: string]: unknown } | undefined;
    },
    vars?: { [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<unknown[]> {
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

    return output;
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

  async select<T extends { [p: string]: unknown } = { [p: string]: unknown }>(
    thing: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async select<T extends { [p: string]: unknown } = { [p: string]: unknown }>(
    thing: object,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async select(
    thing: string | object,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("select", [thing], options);
  }

  async create<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: string,
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async create<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: object,
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async create(
    thing: string | object,
    data?: { [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("create", [thing, data], options);
  }

  async insert<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: string,
    data?: U | readonly U[] | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async insert<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: object,
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async insert(
    thing: string | object,
    data?:
      | { [p: string]: unknown }
      | readonly { [p: string]: unknown }[]
      | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("insert", [thing, data], options);
  }

  async update<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: string,
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async update<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: object,
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async update(
    thing: string | object,
    data?: { [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("update", [thing, data], options);
  }

  async upsert<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: string,
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async upsert<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: object,
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async upsert(
    thing: string | object,
    data?: { [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("upsert", [thing, data], options);
  }

  async merge<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: string,
    data: U,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async merge<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    thing: object,
    data: U,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async merge(
    thing: string | object,
    data: { [p: string]: unknown },
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("merge", [thing, data], options);
  }

  async patch<T extends { [p: string]: unknown } = { [p: string]: unknown }>(
    thing: string,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<ActionResult<T>[]>;

  async patch<T extends { [p: string]: unknown } = { [p: string]: unknown }>(
    thing: object,
    patches: readonly ReadonlyPatch[],
    options?:
      | (ClientRpcOptions & { readonly diff?: false | undefined })
      | undefined,
  ): Promise<ActionResult<T>>;

  async patch(
    thing: string,
    patches: readonly ReadonlyPatch[],
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<Patch[][]>;

  async patch(
    thing: object,
    patches: readonly ReadonlyPatch[],
    options: ClientRpcOptions & { readonly diff: true },
  ): Promise<Patch[]>;

  async patch(
    thing: string | object,
    patches: readonly ReadonlyPatch[],
    options?: PatchOptions | undefined,
  ) {
    const { diff, ...rest } = options || {};

    return await this.rpc("patch", [thing, patches, diff], rest);
  }

  async delete<T extends { [p: string]: unknown } = { [p: string]: unknown }>(
    thing: string,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  async delete<T extends { [p: string]: unknown } = { [p: string]: unknown }>(
    thing: object,
    options?: ClientRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async delete(
    thing: string | object,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("delete", [thing], options);
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
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
  >(
    from: string | object | readonly object[],
    thing: string,
    to: string | object | readonly object[],
    data?: U | undefined,
    options?: ClientRpcOptions | undefined,
  ): Promise<T[]>;

  async relate<
    T extends { [p: string]: unknown } = { [p: string]: unknown },
    U extends { [p: string]: unknown } = T,
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
    data?: { [p: string]: unknown } | undefined,
    options?: ClientRpcOptions | undefined,
  ) {
    return await this.rpc("relate", [from, thing, to, data], options);
  }
}