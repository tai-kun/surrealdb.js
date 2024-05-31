import type { Simplify } from "type-fest";
import { StateTransitionError } from "../common/errors";
import type {
  BidirectionalRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "../common/types";
import type { Formatter } from "../formatters/Formatter";
import {
  collectErrors,
  type Err,
  err,
  type Ok,
  ok,
  type TaskEmitter,
} from "../internal";
import type { Validator } from "../validators/Validator";

/**
 * The current state of the connection.
 *
 * - `0` CONNECTING
 * - `1` OPEN
 * - `2` CLOSING
 * - `3` CLOSED
 */
export type ConnectionState = 0 | 1 | 2 | 3;

/**
 * Engine-derived error dispatched to the emitter.
 */
export type EngineError =
  | {
    name: "HttpEngineError";
    message: string;
    cause?: unknown;
    critical?: boolean;
  } // This is not currently in use and is reserved for future use.
  | {
    name: "WebsocketEngineError";
    message: string;
    cause?: unknown;
    critical?: boolean;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close#code
     */
    code: number;
  }
  | {
    name: string & {};
    message: string;
    cause?: unknown;
    critical?: boolean;
  };

/**
 * The engine events.
 */
export type EngineEvents =
  & {
    [S in ConnectionState]: [result: Ok<S> | Err<unknown, { value: S }>];
  }
  & {
    [_: `rpc/${BidirectionalRpcResponse["id"]}`]: [response: RpcResponse];
    [_: `live/${string}`]: [response: Simplify<Omit<LiveResult, "id">>];
    error: [error: EngineError];
  };

/**
 * The connection information.
 */
export interface Connection {
  /**
   * Endpoint URL
   */
  url?: URL;
  /**
   * Namespace
   */
  ns?: string;
  /**
   * Database
   */
  db?: string;
  /**
   * Authorization token
   */
  token?: string;
}

/**
 * The engine configuration.
 */
export interface EngineConfig {
  /**
   * The event emitter for the engine.
   */
  readonly emitter: TaskEmitter<EngineEvents>;
  /**
   * The formatter for encoding and decoding data.
   */
  readonly formatter: Formatter;
  /**
   * The validator for the engine.
   */
  readonly validator: Validator;
}

export const CONNECTING = 0 as const satisfies ConnectionState;

export const OPEN = 1 as const satisfies ConnectionState;

export const CLOSING = 2 as const satisfies ConnectionState;

export const CLOSED = 3 as const satisfies ConnectionState;

export abstract class Engine {
  /**
   * The event emitter for the engine.
   * Do not destroy the emitter within the engine.
   * It is the responsibility of `Surreal` using this engine.
   */
  protected ee: TaskEmitter<EngineEvents>;
  /**
   * The formatter for encoding and decoding data.
   */
  protected fmt: Formatter;
  /**
   * The validator for the engine.
   */
  protected v8n: Validator;
  /**
   * The connection information.
   */
  protected conn: Connection = {};

  #state: ConnectionState = CLOSED;

  /**
   * Creates a new `Engine` instance.
   *
   * @param config - The configuration for the engine.
   */
  constructor(config: EngineConfig) {
    this.ee = config.emitter;
    this.fmt = config.formatter;
    this.v8n = config.validator;
  }

  /**
   * Set the state of the connection.
   *
   * @param state - The new state of the connection.
   * @param fallback - The fallback state if the state transition fails.
   * @description
   * ```ts
   * // Representation in state machine
   * {
   *   initial: CLOSED,
   *   states: {
   *     [CLOSED]: {
   *       on: {
   *         [CLOSED]: CLOSED,
   *         [CONNECTING]: OPEN,
   *       },
   *     },
   *     [CONNECTING]: {
   *       on: {
   *         [CONNECTING]: CONNECTING,
   *         [OPEN]: OPEN,
   *         [CLOSED]: CLOSED,
   *       },
   *     },
   *     [OPEN]: {
   *       on: {
   *         [OPEN]: OPEN,
   *         [CLOSING]: CLOSED,
   *       },
   *     },
   *     [CLOSING]: {
   *       on: {
   *         [CLOSING]: CLOSING,
   *         [CLOSED]: CLOSED,
   *       },
   *     },
   *   },
   * }
   * ```
   */
  protected async setState(
    state: ConnectionState,
    fallback: () => ConnectionState,
  ): Promise<void> {
    const currentState = this.#state;
    this.#state = state;
    const result = ok(state);
    const promises = this.ee.emit(state, result as any) || [];

    if (promises.length) {
      const errors = await collectErrors(promises);

      if (errors.length) {
        this.#state = fallback();
        const error = new StateTransitionError(currentState, state, {
          cause: errors,
        });

        // Notify the error to the listeners.
        const result = err<unknown, { value: ConnectionState }>(error, {
          value: this.#state,
        });
        this.ee.emit(this.#state, result as any);

        throw error;
      }
    }
  }

  /**
   * The current state of the connection.
   */
  get state(): ConnectionState {
    return this.#state;
  }

  /**
   * The connection information.
   * This connection information is copied each time it is referenced.
   * Therefore, you cannot modify it by circumventing the implemented methods.
   */
  get connection(): Connection {
    const conn = { ...this.conn }; // copy

    if (conn.url) {
      conn.url = new URL(conn.url); // copy
    }

    return conn;
  }

  /**
   * Connect to the given URL.
   *
   * @param url - The URL to connect to.
   */
  abstract connect(url: URL): Promise<void>;

  /**
   * Disconnect from the server.
   *
   * @returns A promise that resolves with the result of the disconnection.
   */
  abstract disconnect(): Promise<
    | Ok<"Disconnected">
    | Ok<"AlreadyDisconnected">
    | Err<unknown>
  >;

  /**
   * Send a RPC request to the server.
   *
   * @param request - The request to send.
   * @param signal - The signal to abort the request.
   * @returns A promise that resolves with the response.
   */
  abstract rpc(request: RpcRequest, signal: AbortSignal): Promise<RpcResponse>;
}
