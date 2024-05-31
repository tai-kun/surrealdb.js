import type { Promisable } from "type-fest";
import {
  CircularEngineReference,
  ConnectionConflict,
  ConnectionUnavailable,
  EngineDisconnected,
  ResponseError,
  UnsupportedProtocol,
} from "../common/errors";
import type {
  RpcMethod,
  RpcParams,
  RpcResponse,
  RpcResult,
} from "../common/types";
import {
  CLOSED,
  type Connection,
  type ConnectionState,
  type Engine,
  type EngineEvents,
  OPEN,
} from "../engines/Engine";
import { type Err, err, mutex, type Ok, ok, TaskEmitter } from "../internal";
import type { Validator } from "../validators/Validator";

/******************************************************************************
 * Client
 *****************************************************************************/

/**
 * The arguments for an engine factory.
 */
export interface EngineArgs {
  /**
   * The event emitter for the engine.
   */
  emitter: TaskEmitter<EngineEvents>;
  /**
   * The validator.
   */
  validator: Validator;
}

/**
 * The engines for each protocol.
 * If the value is a string, it will be resolved as a key in the engines object.
 */
export interface Engines {
  [protocol: string]: ((args: EngineArgs) => Promisable<Engine>) | string;
}

/**
 * The options for Surreal.
 */
export interface SurrealConfig {
  /**
   * The engines for each protocol.
   * If the value is a string, it will be resolved as a key in the engines object.
   *
   * @default {}
   */
  readonly engines?: Readonly<Engines> | undefined;
  /**
   * The validator.
   *
   * @default new EmptyValidator()
   */
  readonly validator: Validator;
}

/**
 * The options for disconnecting.
 */
export interface SurrealDisconnectOptions {
  /**
   * Whether to force the disconnection.
   * If true, An unresolved promise is requested to be aborted.
   *
   * @default false
   */
  readonly force?: boolean | undefined;
  /**
   * The abort signal for the disconnection.
   *
   * @default AbortSignal.timeout(15_000)
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * The options for an RPC call.
 */
export interface SurrealRpcOptions {
  /**
   * The abort signal for the RPC call.
   *
   * @default AbortSignal.timeout(5_000)
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * The core for Surreal.
 */
export class Surreal {
  /**
   * The event emitter for the engine.
   */
  protected ee: TaskEmitter<EngineEvents>;
  /**
   * The validator for the engine.
   */
  protected v8n: Validator;
  /**
   * The engine for the connection.
   */
  protected conn: Engine | null;

  /**
   * The engines for each protocol.
   */
  engines: Engines;

  /**
   * @param config - The configuration for Surreal.
   */
  constructor(config: SurrealConfig) {
    this.ee = new TaskEmitter();
    this.v8n = config.validator;
    this.conn = null;
    this.engines = { ...config.engines };
  }

  get state(): ConnectionState {
    return this.conn?.state ?? CLOSED;
  }

  get events(): TaskEmitter<EngineEvents> {
    // TODO(tai-kun): readonly
    return this.ee;
  }

  get connection(): Connection | null {
    return this.conn?.connection || null;
  }

  /**
   * Connect to the given URL.
   *
   * @param url - The URL to connect to.
   */
  @mutex
  async connect(url: string | URL): Promise<void> {
    url = new URL(url); // copy

    if (!url.pathname.endsWith("/rpc")) {
      if (!url.pathname.endsWith("/")) {
        url.pathname += "/";
      }

      url.pathname += "rpc";
    }

    if (this.state === OPEN) {
      if (this.conn && this.conn.connection.url!.href !== url.href) {
        throw new ConnectionConflict(this.conn.connection.url!, url);
      }

      return;
    }

    const protocol = url.protocol.slice(0, -1 /* remove `:` */);
    const seen: string[] = [];
    let engine = this.engines[protocol];

    while (typeof engine === "string") {
      if (seen.includes(engine)) {
        throw new CircularEngineReference(seen);
      }

      seen.push(engine);
      engine = this.engines[engine];
    }

    if (!engine) {
      throw new UnsupportedProtocol(protocol);
    }

    this.ee.on("error", (_, error) => {
      console.error(error);
      this.disconnect({ force: true }).then(result => {
        if (!result.ok) {
          console.error(result.error);
        }
      });
    });
    this.conn = await engine({
      emitter: this.ee,
      validator: this.v8n,
    });
    await this.conn.connect(url);
  }

  /**
   * Disconnect from the server.
   *
   * @param options - The options for disconnecting.
   * @returns A promise that resolves with the result of disconnecting.
   */
  @mutex
  async disconnect(
    options: SurrealDisconnectOptions | undefined = {},
  ): Promise<
    | Ok
    | Ok<"AlreadyDisconnected">
    | Err<unknown>
  > {
    try {
      if (!this.conn || this.state === CLOSED) {
        return ok("AlreadyDisconnected");
      }

      const {
        force = false,
        signal = AbortSignal.timeout(15_000),
      } = options;
      const promise = this.ee.once(CLOSED, { signal });

      if (force) {
        this.ee.abort(new EngineDisconnected());
      }

      const disconnResult = await this.conn.disconnect();

      try {
        const [result] = await promise;

        if (!result.ok) {
          throw result.error;
        }
      } finally {
        await this.ee.dispose();
      }

      const disposeResult = await this.ee.dispose();

      if (!disconnResult.ok) {
        throw disconnResult.error;
      }

      return disposeResult;
    } catch (error) {
      return err(error);
    } finally {
      this.ee = new TaskEmitter();
      this.conn = null;
    }
  }

  /**
   * Perform an RPC call.
   *
   * @template M - The type of the method of the RPC call.
   * @param method - The method of the RPC call.
   * @param params - The parameters of the RPC call.
   * @param options - The options for the RPC call.
   * @returns A promise that resolves with the result of the RPC call.
   */
  async rpc<M extends RpcMethod, T extends RpcResult<M>>(
    method: M,
    params: RpcParams<M>,
    options: SurrealRpcOptions | undefined = {},
  ): Promise<T> {
    if (!this.conn) {
      throw new ConnectionUnavailable();
    }

    const resp: RpcResponse<any> = await this.conn.rpc(
      // @ts-expect-error
      { method, params },
      options.signal || AbortSignal.timeout(5_000),
    );

    if ("result" in resp) {
      return resp.result;
    }

    throw new ResponseError(resp.error);
  }

  /**
   * Ping the SurrealDB server.
   *
   * @param options - The options for the RPC call.
   */
  async ping(options?: SurrealRpcOptions | undefined): Promise<void> {
    await this.rpc("ping", [], options);
  }
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
} from "../values/tiny";

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
