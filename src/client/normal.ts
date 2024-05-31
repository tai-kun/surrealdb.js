import type { Simplify } from "type-fest";
import { ResponseError } from "../common/errors";
import type {
  Auth,
  LiveAction,
  LiveResult,
  Patch,
  QueryResult,
  RecordInputData as RecordData,
  RpcResultMapping,
  ScopeAuth,
} from "../common/types";
import type { TaskListener } from "../internal";
import type { AnyTable, AnyThing, AnyUuid } from "../values/utils";
import { Surreal as SurrealBase, type SurrealRpcOptions } from "./tiny";

/******************************************************************************
 * Client
 *****************************************************************************/

export type {
  EngineArgs,
  Engines,
  SurrealConfig,
  SurrealDisconnectOptions,
  SurrealRpcOptions,
} from "./tiny";

/**
 * The options for a live query.
 */
export interface LiveOptions extends SurrealRpcOptions {
  /**
   * Whether to return the diff of the live query.
   */
  readonly diff?: boolean | null | undefined;
}

/**
 * The handler for live queries.
 *
 * @template T - The type of the result.
 * @param response - The response from the live query.
 */
export type LiveHandler<T extends LiveResult["result"] = LiveResult["result"]> =
  TaskListener<
    [
      response: {
        action: LiveAction;
        result: T;
      },
    ]
  >;

/**
 * Infer the result of a live query.
 *
 * @template I - The UUID of the live query.
 * @template T - The type of the result.
 */
// dprint-ignore
export type InferLiveResult<I, T = unknown>
  = I extends { __diff: true } ? Patch<T>
  : I extends { __diff: false } ? RecordData
  : LiveResult["result"];

/**
 * The result of an action.
 *
 * @template T - The type of the record data.
 */
// dprint-ignore
export type ActionResult<T extends RecordData = RecordData>
  = "id" extends keyof T ? T
  : Simplify<T & { readonly id: string | AnyThing }>;

/**
 * The core for Surreal.
 */
export class Surreal extends SurrealBase {
  /**
   * Switch to a specific namespace.
   *
   * @param ns - The namespace to switch to.
   * @param options - The options for the RPC call.
   */
  async use(
    ns: string | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<void>;

  /**
   * Switch to a specific namespace and database.
   *
   * @param ns - The namespace to switch to.
   * @param db - The database to switch to.
   * @param options - The options for the RPC call.
   */
  async use(
    ns: string | null | undefined,
    db?: string | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<void>;

  /**
   * Switch to a specific namespace and database.
   *
   * @param target - The target namespace and database.
   * @param options - The options for the RPC call.
   */
  async use(
    target: [ns: string | null | undefined, db?: string | null | undefined],
    options?: SurrealRpcOptions | undefined,
  ): Promise<void>;

  /**
   * Switch to a specific namespace and database.
   *
   * @param target - The target namespace and database.
   * @param options - The options for the RPC call.
   */
  async use(
    target: {
      readonly ns?: string | null | undefined;
      readonly db?: string | null | undefined;
    },
    options?: SurrealRpcOptions | undefined,
  ): Promise<void>;

  /**
   * Switch to a specific namespace and database.
   *
   * @param target - The target namespace and database.
   * @param options - The options for the RPC call.
   */
  async use(
    target: {
      readonly namespace?: string | null | undefined;
      readonly database?: string | null | undefined;
    },
    options?: SurrealRpcOptions | undefined,
  ): Promise<void>;

  async use(
    ...args:
      | [
        string | null | undefined,
        (SurrealRpcOptions | undefined)?,
      ]
      | [
        string | null | undefined,
        (string | null | undefined)?,
        (SurrealRpcOptions | undefined)?,
      ]
      | [
        [string | null | undefined, (string | null | undefined)?],
        (SurrealRpcOptions | undefined)?,
      ]
      | [
        {
          readonly ns?: string | null | undefined;
          readonly db?: string | null | undefined;
        },
        (SurrealRpcOptions | undefined)?,
      ]
      | [
        {
          readonly namespace?: string | null | undefined;
          readonly database?: string | null | undefined;
        },
        (SurrealRpcOptions | undefined)?,
      ]
  ): Promise<void> {
    let namespace: string | null | undefined;
    let database: string | null | undefined;
    let options: SurrealRpcOptions | undefined;

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
      options = opts as SurrealRpcOptions | undefined;
    } else if ("ns" in args[0] || "db" in args[0]) {
      const [{ ns, db }, opts] = args;
      namespace = ns;
      database = db;
      options = opts as SurrealRpcOptions | undefined;
    } else if ("namespace" in args[0] || "database" in args[0]) {
      const [{ namespace: ns, database: db }, opts] = args;
      namespace = ns;
      database = db;
      options = opts as SurrealRpcOptions | undefined;
    }

    await this.rpc("use", [namespace, database], options);
  }

  /**
   * Selects everything from the `$auth` variable.
   *
   * ```sql
   * SELECT * FROM $auth;
   * ```
   *
   * @template T - The type of the result.
   * @param options - The options for the RPC call.
   * @returns `$auth` variable.
   */
  async info<T extends RpcResultMapping["info"] = RpcResultMapping["info"]>(
    options?: SurrealRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("info", [], options);
  }

  /**
   * Signs up a user against a scope's `SIGNUP` method.
   *
   * @template T - The type of the result.
   * @param auth - The authentication information.
   * @param options - The options for the RPC call.
   * @returns Json Web Token.
   */
  async signup<
    T extends RpcResultMapping["signup"] = RpcResultMapping["signup"],
  >(
    auth: ScopeAuth,
    options?: SurrealRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("signup", [auth], options);
  }

  /**
   * Signs in a root, namespace, database, or scope user against SurrealDB.
   *
   * @template T - The type of the result.
   * @param auth - The authentication information.
   * @param options - The options for the RPC call.
   * @returns Json Web Token.
   */
  async signin<
    T extends RpcResultMapping["signin"] = RpcResultMapping["signin"],
  >(
    auth: Auth,
    options?: SurrealRpcOptions | undefined,
  ): Promise<T> {
    return await this.rpc("signin", [auth], options);
  }

  /**
   * Authenticate a user against SurrealDB with a token.
   *
   * @param token - The token to authenticate with.
   * @param options - The options for the RPC call.
   */
  async authenticate(
    token: string,
    options?: SurrealRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("authenticate", [token], options);
  }

  /**
   * Invalidate a user's session for the current connection.
   *
   * @param options - The options for the RPC call.
   */
  async invalidate(
    options?: SurrealRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("invalidate", [], options);
  }

  /**
   * Define a variable on the current connection.
   *
   * @param name - The name of the variable.
   * @param value - The value of the variable.
   * @param options - The options for the RPC call.
   */
  async let(
    name: string,
    value: unknown,
    options?: SurrealRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("let", [name, value], options);
  }

  /**
   * Remove a variable from the current connection.
   *
   * @param name - The name of the variable.
   * @param options - The options for the RPC call.
   */
  async unset(
    name: string,
    options?: SurrealRpcOptions | undefined,
  ): Promise<void> {
    await this.rpc("unset", [name], options);
  }

  /**
   * Initiate a live query.
   *
   * @template T - The type of the result.
   * @param table - The table to query.
   * @param options - The options for the RPC call.
   * @returns The live query UUID.
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | AnyTable,
    options: SurrealRpcOptions & { readonly diff: true },
  ): Promise<T & { __diff: true }>;

  /**
   * Initiate a live query.
   *
   * @template T - The type of the result.
   * @param table - The table to query.
   * @param options - The options for the RPC call.
   * @returns The live query UUID.
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | AnyTable,
    options: SurrealRpcOptions & { readonly diff?: false | null | undefined },
  ): Promise<T & { __diff: false }>;

  /**
   * Initiate a live query.
   *
   * @template T - The type of the result.
   * @param table - The table to query.
   * @param options - The options for the RPC call.
   * @returns The live query UUID.
   */
  async live<T extends RpcResultMapping["live"] = RpcResultMapping["live"]>(
    table: string | AnyTable,
    options?:
      | (SurrealRpcOptions & { readonly diff?: boolean | null | undefined })
      | undefined,
  ): Promise<T & { __diff: boolean }>;

  // TODO(tai-kun): Buffering options.
  async live(
    table: string | AnyTable,
    options:
      | (SurrealRpcOptions & { readonly diff?: boolean | null | undefined })
      | undefined = {},
  ) {
    const { diff, ...rest } = options;
    const queryUuid = await this.rpc("live", [table, diff], rest);

    return queryUuid;
  }

  /**
   * Subscribe to a live query.
   *
   * @param queryUuid - The UUID of the live query.
   * @param callback - The callback to handle the live query results.
   */
  subscribe<
    I extends string | AnyUuid,
    T extends InferLiveResult<I> = InferLiveResult<I>,
  >(
    queryUuid: I,
    callback: LiveHandler<T>,
  ): void {
    this.ee.on(`live/${queryUuid}`, callback as LiveHandler);
  }

  /**
   * Unsubscribe from a live query.
   *
   * @param queryUuid - The UUID of the live query.
   * @param callback - The callback to remove from the live query results.
   */
  unsubscribe(
    queryUuid: string | AnyUuid,
    callback: LiveHandler<any>,
  ): void {
    this.ee.off(`live/${queryUuid}`, callback);
  }

  /**
   * Terminate a running live query.
   *
   * @param queryUuid - The UUID of the live query.
   * @param options - The options for the RPC call.
   */
  async kill(
    queryUuid: string | AnyUuid | readonly (string | AnyUuid)[],
    options?: SurrealRpcOptions | undefined,
  ): Promise<void> {
    if (Array.isArray(queryUuid)) {
      await Promise.all(queryUuid.map(async uuid => {
        await this.kill(uuid, options);
      }));
    } else {
      this.ee.off(`live/${queryUuid}`);
      await this.rpc("kill", [queryUuid], options);
    }
  }

  /**
   * Execute a custom SurrealQL with optional variables.
   *
   * @template T - The type of the result.
   * @param surql - The SurrealQL.
   * @param vars - The variables for the SurrealQL.
   * @param options - The options for the RPC call.
   * @returns The raw query result.
   */
  async queryRaw<T extends readonly QueryResult[] = QueryResult[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: RecordData | null | undefined;
    },
    vars?: RecordData | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<T> {
    const results: readonly QueryResult[] = await this.rpc(
      "query",
      [surql, vars],
      options,
    );

    return results as T;
  }

  /**
   * Execute a custom SurrealQL with optional variables.
   *
   * @template T - The type of the result.
   * @param surql - The SurrealQL.
   * @param vars - The variables for the SurrealQL.
   * @param options - The options for the RPC call.
   * @returns The query result.
   */
  async query<T extends readonly unknown[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: RecordData | null | undefined;
      readonly __type: T;
    },
    vars?: RecordData | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<T>;

  /**
   * Execute a custom SurrealQL with optional variables.
   *
   * @template T - The type of the result.
   * @param surql - The SurrealQL.
   * @param vars - The variables for the SurrealQL.
   * @param options - The options for the RPC call.
   * @returns The query result.
   */
  async query<T extends readonly unknown[] = unknown[]>(
    surql: string | {
      readonly text: string;
      readonly vars?: RecordData | null | undefined;
    },
    vars?: RecordData | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<T>;

  async query(
    surql: string | {
      readonly text: string;
      readonly vars?: RecordData | null | undefined;
    },
    vars?: RecordData | null | undefined,
    options?: SurrealRpcOptions | undefined,
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
      throw new ResponseError("Failed to execute the query.", {
        cause: errors,
      });
    }

    return output;
  }
}

/******************************************************************************
 * Utilities
 *****************************************************************************/

/**
 * A SurrealQL.
 *
 * @template T - The type of the SurrealQL.
 */
export class Surql<T extends readonly unknown[] = unknown[]> {
  /**
   * DO NOT USE THIS METHOD.
   *
   * This method is only used for type checking.
   *
   * @deprecated
   */
  // @ts-expect-error
  readonly __type: T;

  readonly #text: string;
  readonly #vars: RecordData | null;

  /**
   * Creates a new SurrealQL.
   *
   * @param text - The text of the SurrealQL.
   * @param vars - The variables of the SurrealQL.
   */
  constructor(text: string, vars: RecordData | null | undefined = null) {
    this.#text = text;
    this.#vars = vars;
  }

  /**
   * The text of the SurrealQL.
   */
  get text(): string {
    return this.#text;
  }

  /**
   * The variables of the SurrealQL.
   */
  get vars(): RecordData | null {
    return this.#vars;
  }
}

/**
 * Creates a new SurrealQL with template literals.
 *
 * @param texts - The texts of the SurrealQL.
 * @param values - The values of the SurrealQL.
 * @returns A new SurrealQL.
 */
export function surql<T extends readonly unknown[] = unknown[]>(
  texts: readonly string[] | TemplateStringsArray,
  ...values: unknown[]
): Surql<T> {
  let PREFIX = "__js_tagged_",
    text = "",
    vars: Record<string, unknown> = {},
    len = texts.length,
    i = 0,
    j: number;

  for (; i < len; i++) {
    text += texts[i];

    if (i in values) {
      j = values.indexOf(values[i]);
      text += `$${PREFIX}${j}`;
      vars[`${PREFIX}${j}`] = values[j];
    }
  }

  return new Surql<T>(text, vars);
}

/******************************************************************************
 * Values
 *****************************************************************************/

export {
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Table,
  Thing,
  type ThingId,
  type ThingIdArray,
  type ThingIdObject,
  type ThingIdPrimitive,
  Uuid,
} from "../values/normal";

/******************************************************************************
 * Others
 *****************************************************************************/

export {
  AggregateTasksError,
  CircularEngineReference,
  ConnectionConflict,
  ConnectionUnavailable,
  DataConversionFailure,
  EngineAlreadyConnected,
  EngineDisconnected,
  MissingNamespace,
  ResourceDisposed,
  ResponseError,
  StateTransitionError,
  SurrealDbError,
  UnknownCborTag,
  UnsupportedProtocol,
  ValidationError,
} from "../common/errors";
export { RpcResponseData } from "../common/RpcResponseData";
export type * from "../common/types";
export {
  CLOSED,
  CLOSING,
  CONNECTING,
  type Connection,
  type ConnectionState,
  Engine,
  type EngineConfig,
  type EngineError,
  type EngineEvents,
  OPEN,
} from "../engines/Engine";
export {
  HttpEngine,
  type HttpEngineConfig,
  type HttpEngineFetcher,
  type HttpEngineFetchRequestInit,
  type HttpEngineFetchResponse,
} from "../engines/HttpEngine";
export {
  type CreateWebSocket,
  WebsocketEngine,
  type WebsocketEngineConfig,
} from "../engines/WebsocketEngine";
export { CborFormatter, type CborValues } from "../formatters/CborFormatter";
export { Formatter, type RpcData } from "../formatters/Formatter";
export { JsonFormatter } from "../formatters/JsonFormatter";
export { EmptyValidator } from "../validators/EmptyValidator";
export { type ValidationResult, Validator } from "../validators/Validator";
export { ZodValidator } from "../validators/ZodValidator";
export {
  type AnyDatetime,
  type AnyDecimal,
  type AnyDuration,
  type AnyGeometryCollection,
  type AnyGeometryLine,
  type AnyGeometryMultiLine,
  type AnyGeometryMultiPoint,
  type AnyGeometryMultiPolygon,
  type AnyGeometryPoint,
  type AnyGeometryPolygon,
  type AnyTable,
  type AnyThing,
  type AnyUuid,
  isDatetime,
  isDecimal,
  isDuration,
  isGeometryCollection,
  isGeometryLine,
  isGeometryMultiLine,
  isGeometryMultiPoint,
  isGeometryMultiPolygon,
  isGeometryPoint,
  isGeometryPolygon,
  isTable,
  isThing,
  isUuid,
} from "../values/utils";
