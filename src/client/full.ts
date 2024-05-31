import type {
  Patch,
  ReadonlyPatch,
  RecordInputData as RecordData,
} from "../common/types";
import type { AnyThing } from "../values/utils";
import {
  type ActionResult,
  Surreal as SurrealBase,
  type SurrealRpcOptions,
} from "./normal";

/******************************************************************************
 * Client
 *****************************************************************************/

export type {
  ActionResult,
  EngineArgs,
  Engines,
  InferLiveResult,
  LiveHandler,
  LiveOptions,
  SurrealConfig,
  SurrealDisconnectOptions,
  SurrealRpcOptions,
} from "./normal";

/**
 * The core for Surreal.
 */
export class Surreal extends SurrealBase {
  /**
   * Select either all records in a table or a single record.
   *
   * @template T - The type of the result.
   * @param thing - The table name to select from.
   * @param options - The options for the RPC call.
   * @returns The selected records.
   */
  async select<T extends RecordData = RecordData>(
    thing: string,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * Select a single record.
   *
   * @template T - The type of the result.
   * @param thing - The record ID to select.
   * @param options - The options for the RPC call.
   * @returns The selected record.
   */
  async select<T extends RecordData = RecordData>(
    thing: AnyThing,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async select(
    thing: string | AnyThing,
    options?: SurrealRpcOptions | undefined,
  ) {
    return await this.rpc("select", [thing], options);
  }

  /**
   * Create either a single or multiple records.
   *
   * @template T - The type of the result.
   * @template U - The type of the data to create.
   * @param thing - The table name to create in.
   * @param data - The data to create.
   * @param options - The options for the RPC call.
   * @returns The created records.
   */
  async create<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: string,
    data?: U | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * Create a new record.
   *
   * @template T - The type of the result.
   * @template U - The type of the data to create.
   * @param thing - The table name to create in.
   * @param data - The data to create.
   * @param options - The options for the RPC call.
   * @returns The created record.
   */
  async create<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: AnyThing,
    data?: U | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async create(
    thing: string | AnyThing,
    data?: RecordData | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ) {
    return await this.rpc("create", [thing, data], options);
  }

  /**
   * Insert either a single or multiple records.
   *
   * @template T - The type of the result.
   * @template U - The type of the data to insert.
   * @param thing - The table name to insert into.
   * @param data - The data to insert.
   * @param options - The options for the RPC call.
   * @returns The inserted records.
   */
  async insert<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: string,
    data?: U | readonly U[] | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * Insert a new record.
   *
   * @template T - The type of the result.
   * @template U - The type of the data to insert.
   * @param thing - The table name to insert into.
   * @param data - The data to insert.
   * @param options - The options for the RPC call.
   * @returns The inserted record.
   */
  async insert<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: AnyThing,
    data?: U | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async insert(
    thing: string | AnyThing,
    data?: RecordData | readonly RecordData[] | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ) {
    return await this.rpc("insert", [thing, data], options);
  }

  /**
   * Update either a single or multiple records.
   *
   * @template T - The type of the result.
   * @template U - The type of the data to update.
   * @param thing - The table name to update in.
   * @param data - The data to update.
   * @param options - The options for the RPC call.
   * @returns The updated records.
   */
  async update<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: string,
    data?: U | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * Update a record.
   *
   * @template T - The type of the result.
   * @template U - The type of the data to update.
   * @param thing - The table name to update in.
   * @param data - The data to update.
   * @param options - The options for the RPC call.
   * @returns The updated record.
   */
  async update<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: AnyThing,
    data?: U | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async update(
    thing: string | AnyThing,
    data?: RecordData | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ) {
    return await this.rpc("update", [thing, data], options);
  }

  /**
   * Merge either a single or multiple records.
   *
   * @template T - The type of the result.
   * @template U - The type of the data to merge.
   * @param thing - The table name to merge in.
   * @param data - The data to merge.
   * @param options - The options for the RPC call.
   */
  async merge<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: string,
    data: U,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * Merge a record.
   *
   * @template T - The type of the result.
   * @template U - The type of the data to merge.
   * @param thing - The table name to merge in.
   * @param data - The data to merge.
   * @param options - The options for the RPC call.
   */
  async merge<T extends RecordData = RecordData, U extends RecordData = T>(
    thing: AnyThing,
    data: U,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async merge(
    thing: string | AnyThing,
    data: RecordData,
    options?: SurrealRpcOptions | undefined,
  ) {
    return await this.rpc("merge", [thing, data], options);
  }

  /**
   * Patch either a single or multiple records.
   *
   * @template T - The type of the result.
   * @param thing - The table name to patch in.
   * @param patches - The patches to apply.
   * @param options - The options for the RPC call.
   * @returns The patched records.
   */
  async patch<T extends RecordData = RecordData>(
    thing: string,
    patches: readonly ReadonlyPatch[],
    options?:
      | (SurrealRpcOptions & { readonly diff?: false | null | undefined })
      | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * Patch a record.
   *
   * @template T - The type of the result.
   * @param thing - The table name to patch in.
   * @param patches - The patches to apply.
   * @param options - The options for the RPC call.
   * @returns The patched record.
   */
  async patch<T extends RecordData = RecordData>(
    thing: AnyThing,
    patches: readonly ReadonlyPatch[],
    options?:
      | (SurrealRpcOptions & { readonly diff?: false | null | undefined })
      | undefined,
  ): Promise<ActionResult<T>>;

  /**
   * Patch either a single or multiple records.
   *
   * @param thing - The table name to patch in.
   * @param patches - The patches to apply.
   * @param options - The options for the RPC call.
   * @returns The JSON patches.
   */
  async patch(
    thing: string,
    patches: readonly ReadonlyPatch[],
    options: SurrealRpcOptions & { readonly diff: true },
  ): Promise<Patch[][]>;

  /**
   * Patch a record.
   *
   * @param thing - The table name to patch in.
   * @param patches - The patches to apply.
   * @param options - The options for the RPC call.
   * @returns The JSON patches.
   */
  async patch(
    thing: AnyThing,
    patches: readonly ReadonlyPatch[],
    options: SurrealRpcOptions & { readonly diff: true },
  ): Promise<Patch[]>;

  async patch(
    thing: string | AnyThing,
    patches: readonly ReadonlyPatch[],
    options?:
      | (SurrealRpcOptions & { readonly diff?: boolean | null | undefined })
      | undefined,
  ) {
    const { diff, ...rest } = options || {};

    return await this.rpc("patch", [thing, patches, diff], rest);
  }

  /**
   * Delete either a single or multiple records.
   *
   * @template T - The type of the result.
   * @param thing - The table name to delete from.
   * @param options - The options for the RPC call.
   * @returns The deleted records.
   */
  async delete<T extends RecordData = RecordData>(
    thing: string,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>[]>;

  /**
   * Delete a record.
   *
   * @template T - The type of the result.
   * @param thing - The record ID to delete.
   * @param options - The options for the RPC call.
   * @returns The deleted record.
   */
  async delete<T extends RecordData = RecordData>(
    thing: AnyThing,
    options?: SurrealRpcOptions | undefined,
  ): Promise<ActionResult<T>>;

  async delete(
    thing: string | AnyThing,
    options?: SurrealRpcOptions | undefined,
  ) {
    return await this.rpc("delete", [thing], options);
  }

  /**
   * Get the version of SurrealDB.
   *
   * @param options - The options for the RPC call.
   * @returns The version of SurrealDB.
   */
  async version(options?: SurrealRpcOptions | undefined): Promise<string> {
    return await this.rpc("version", [], options);
  }

  /**
   * Run a custom or built-in function.
   *
   * @template T - The type of the result.
   * @param funcName - The name of the function to run.
   * @param options - The options for the RPC call.
   * @returns The result of the function.
   */
  async run<T = unknown>(
    funcName: string,
    options?:
      | (SurrealRpcOptions & { readonly version?: string | null | undefined })
      | undefined,
  ): Promise<T>;

  /**
   * Run a custom or built-in function.
   *
   * @template T - The type of the result.
   * @param funcName - The name of the function to run.
   * @param args - The arguments for the function.
   * @param options - The options for the RPC call.
   * @returns The result of the function.
   */
  async run<T = unknown>(
    funcName: string,
    args?: readonly unknown[] | null | undefined,
    options?:
      | (SurrealRpcOptions & { readonly version?: string | null | undefined })
      | undefined,
  ): Promise<T>;

  async run(
    funcName: string,
    arg1?:
      | readonly unknown[]
      | (SurrealRpcOptions & { readonly version?: string | null | undefined })
      | null
      | undefined,
    arg2?:
      | (SurrealRpcOptions & { readonly version?: string | null | undefined })
      | undefined,
  ) {
    const [args, opts] = Array.isArray(arg1) || arg1 === null
      ? [arg1, arg2] as const
      : [null, arg1] as const;
    const { version, ...rest } = opts || {};

    return await this.rpc("run", [funcName, version, args], rest);
  }

  /**
   * Generate graph edges between records.
   *
   * @template T - The type of the result.
   * @param from - The source record ID.
   * @param thing - The edge name.
   * @param to - The target record ID.
   * @param data - The data to associate with the edge.
   * @param options - The options for the RPC call.
   * @returns The graph edges.
   */
  async relate<T extends RecordData = RecordData, U extends RecordData = T>(
    from: string | AnyThing | readonly AnyThing[],
    thing: string,
    to: string | AnyThing | readonly AnyThing[],
    data?: U | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<T[]>;

  /**
   * Generate graph edges between records.
   *
   * @template T - The type of the result.
   * @param from - The source record ID.
   * @param thing - The edge name.
   * @param to - The target record ID.
   * @param data - The data to associate with the edge.
   * @param options - The options for the RPC call.
   * @returns The graph edge.
   */
  async relate<T extends RecordData = RecordData, U extends RecordData = T>(
    from: string | AnyThing | readonly AnyThing[],
    thing: AnyThing,
    to: string | AnyThing | readonly AnyThing[],
    data?: U | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ): Promise<T>;

  async relate(
    from: string | AnyThing | readonly AnyThing[],
    thing: string | AnyThing,
    to: string | AnyThing | readonly AnyThing[],
    data?: RecordData | null | undefined,
    options?: SurrealRpcOptions | undefined,
  ) {
    return await this.rpc("relate", [from, thing, to, data], options);
  }
}

/******************************************************************************
 * Utilities
 *****************************************************************************/

export { Surql, surql } from "./normal";

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
} from "../values/full";

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
