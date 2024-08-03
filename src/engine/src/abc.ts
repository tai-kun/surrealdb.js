import {
  type HttpEngineError,
  StateTransitionError,
  type WebSocketEngineError,
} from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import type {
  BidirectionalRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "@tai-kun/surrealdb/types";
import { StatefulPromise, type TaskEmitter } from "@tai-kun/surrealdb/utils";
import type { Validator } from "@tai-kun/surrealdb/validator";

type Simplify<T> = { [P in keyof T]: T[P] } & {};

type SetOptional<T, P extends keyof T> = Simplify<
  & Omit<T, P>
  & { [K in P]+?: T[K] }
>;

type OptionalOnNull<T> = SetOptional<
  T,
  {
    [P in keyof T]: null extends T[P] ? P : never;
  }[keyof T]
>;

type NonNullKeysOf<T> = {
  [P in keyof T]: null extends T[P] ? never : P;
}[keyof T];

/**
 * - `0` CONNECTING
 * - `1` OPEN
 * - `2` CLOSING
 * - `3` CLOSED
 */
export type ConnectionState = 0 | 1 | 2 | 3;

export namespace ConnectionInfo {
  type Info<S extends ConnectionState, E, N, D, T> = {
    state: S;
    endpoint: E;
    namespace: N;
    database: D;
    token: T;
  };

  export type Connecting = Info<typeof CONNECTING, URL, null, null, null>;

  export type Open = Info<
    typeof OPEN,
    URL,
    string | null,
    string | null,
    string | null
  >;

  export type Closing = Info<
    typeof CLOSING,
    URL,
    string | null,
    string | null,
    string | null
  >;

  export type Closed = Info<typeof CLOSED, null, null, null, null>;
}

export type ConnectionInfo =
  | ConnectionInfo.Connecting
  | ConnectionInfo.Open
  | ConnectionInfo.Closing
  | ConnectionInfo.Closed;

/**
 * {@link TransitionArgs}
 */
type _TransitionArgs<S, T> =
  | Readonly<OptionalOnNull<T>>
  // state のみ必須なら、その値だけを受け入れられるようにする。
  | (NonNullKeysOf<T> extends "state" ? S : never);

export type TransitionArgs = {
  [S in ConnectionState]: _TransitionArgs<
    S,
    Extract<ConnectionInfo, { state: S }>
  >;
}[ConnectionState];

function transArgsToConnInfo(args: TransitionArgs): ConnectionInfo {
  const conn = {
    ns: null,
    db: null,
    token: null,
    endpoint: null,
    ...(typeof args === "number" ? { state: args } : args),
  };

  if (conn.endpoint) {
    conn.endpoint = new URL(conn.endpoint); // コピー
  }

  return conn;
}

export type EngineEvents =
  & {
    // 状態遷移に関するイベント。
    [S in ConnectionState]: [
      result:
        // 状態遷移に成功した場合。
        | { state: S; error?: never }
        // 状態遷移に失敗した場合。
        | { state: S; error: unknown },
    ];
  }
  & {
    // 双方向通信における RPC レスポンスのイベント。
    [_: `rpc_${BidirectionalRpcResponse["id"]}`]: [response: RpcResponse];
    // ライブクエリーの結果のイベント。
    [_: `live_${string}`]: [response: Simplify<Omit<LiveResult, "id">>];
    // エンジン内エラーを通知するイベント。
    error: [error: HttpEngineError | WebSocketEngineError];
  };

export interface EngineAbcConfig {
  readonly emitter: TaskEmitter<EngineEvents>;
  readonly formatter: Formatter;
  readonly validator: Validator;
}

export interface ConnectArgs {
  signal: AbortSignal;
  endpoint: URL;
}

export interface DisconnectArgs {
  signal: AbortSignal;
}

export interface RpcArgs {
  signal: AbortSignal;
  request: RpcRequest;
}

export const CONNECTING = 0 as const satisfies ConnectionState;
export const OPEN = 1 as const satisfies ConnectionState;
export const CLOSING = 2 as const satisfies ConnectionState;
export const CLOSED = 3 as const satisfies ConnectionState;

export abstract class EngineAbc {
  protected ee: TaskEmitter<EngineEvents>;
  protected fmt: Formatter;
  protected v8n: Validator;

  private _conn: ConnectionInfo = {
    token: null,
    state: CLOSED,
    endpoint: null,
    database: null,
    namespace: null,
  };

  constructor(config: EngineAbcConfig) {
    this.ee = config.emitter;
    this.fmt = config.formatter;
    this.v8n = config.validator;
  }

  protected transition(
    args: TransitionArgs,
    fallback: () => TransitionArgs,
  ): StatefulPromise<void> {
    return new StatefulPromise<void>((resolve, reject) => {
      const fromState = this.state;
      const toState = (this._conn = transArgsToConnInfo(args)).state;
      const hooks = this.ee.emit(toState, {
        state: toState as never,
      });

      if (!hooks || hooks.length <= 0) {
        return resolve();
      }

      StatefulPromise.allRejected(hooks).then(errors => {
        if (errors.length > 0) {
          const args = fallback();
          const fbState = (this._conn = transArgsToConnInfo(args)).state;
          reject(new StateTransitionError(fromState, toState, fbState, errors));
        } else {
          resolve();
        }
      });
    });
  }

  get state(): ConnectionState {
    return this._conn.state;
  }

  get endpoint(): URL | null {
    return this._conn.endpoint && new URL(this._conn.endpoint); // コピー
  }

  get namespace(): string | null {
    return this._conn.namespace;
  }

  set namespace(ns: string | null) {
    if (this._conn.state === OPEN) {
      this._conn.namespace = ns;
    }
  }

  get database(): string | null {
    return this._conn.database;
  }

  set database(db: string | null) {
    if (this._conn.state === OPEN) {
      this._conn.database = db;
    }
  }

  get token(): string | null {
    return this._conn.token;
  }

  set token(token: string | null) {
    if (this._conn.state === OPEN) {
      this._conn.token = token;
    }
  }

  getConnectionInfo(): ConnectionInfo {
    const conn = { ...this._conn }; // コピー

    if (conn.endpoint) {
      conn.endpoint = new URL(conn.endpoint); // コピー
    }

    return conn;
  }

  abstract readonly name: string;

  abstract connect(args: ConnectArgs): PromiseLike<void>;

  abstract disconnect(args: DisconnectArgs): PromiseLike<void>;

  abstract rpc(args: RpcArgs): PromiseLike<RpcResponse>;
}
