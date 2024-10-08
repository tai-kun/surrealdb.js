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
import type { SetOptional, Simplify } from "type-fest";

type OptionalOnNull<T> = SetOptional<
  T,
  {
    [P in keyof T]: null extends T[P] ? P : never;
  }[keyof T]
>;

type NonNullKeysOf<T> = {
  [P in keyof T]: null extends T[P] ? never : P;
}[keyof T];

export type ConnectionState =
  | "connecting"
  | "open"
  | "closing"
  | "closed";

export namespace ConnectionInfo {
  type Info<
    TState extends ConnectionState,
    TEndpoint,
    TNamespace,
    TDatabase,
    TToken,
  > = {
    state: TState;
    endpoint: TEndpoint;
    namespace: TNamespace;
    database: TDatabase;
    token: TToken;
  };

  export type Connecting = Info<"connecting", URL, null, null, null>;

  export type Open = Info<
    "open",
    URL,
    string | null,
    string | null,
    string | null
  >;

  export type Closing = Info<
    "closing",
    URL,
    string | null,
    string | null,
    string | null
  >;

  export type Closed = Info<"closed", null, null, null, null>;
}

export type ConnectionInfo =
  | ConnectionInfo.Connecting
  | ConnectionInfo.Open
  | ConnectionInfo.Closing
  | ConnectionInfo.Closed;

/**
 * {@link TransitionArgs}
 */
type _TransitionArgs<TState, TConnInfo> =
  | OptionalOnNull<TConnInfo>
  // state のみ必須なら、その値だけを受け入れられるようにする。
  | (NonNullKeysOf<TConnInfo> extends "state" ? TState : never);

export type TransitionArgs = {
  [TState in ConnectionState]: _TransitionArgs<
    TState,
    Extract<ConnectionInfo, { state: TState }>
  >;
}[ConnectionState];

function transArgsToConnInfo(args: TransitionArgs): ConnectionInfo {
  const conn: ConnectionInfo = Object.assign(
    {
      token: null,
      endpoint: null,
      database: null,
      namespace: null,
    },
    typeof args === "string"
      ? { state: args }
      : args,
  );

  if (conn.endpoint) {
    conn.endpoint = new URL(conn.endpoint); // コピー
  }

  return conn;
}

export type EngineEventMap =
  & {
    // 状態遷移に関するイベント。
    [TState in ConnectionState]: [
      result:
        // 状態遷移に成功した場合。
        | { state: TState; error?: never }
        // 状態遷移に失敗した場合。
        | { state: TState; error: unknown },
    ];
  }
  & {
    // 双方向通信における RPC レスポンスのイベント。
    [_: `rpc_${BidirectionalRpcResponse["id"]}`]: [
      response: BidirectionalRpcResponse,
    ];
    // ライブクエリーの結果のイベント。
    [_: `live_${string}`]: [response: Simplify<Omit<LiveResult, "id">>];
    // エンジン内エラーを通知するイベント。
    error: [error: HttpEngineError | WebSocketEngineError];
  };

export interface EngineAbcConfig {
  readonly emitter: TaskEmitter<EngineEventMap>;
  readonly formatter: Formatter;
}

export interface ConnectArgs {
  signal: AbortSignal;
  endpoint: URL;
}

export interface CloseArgs {
  signal: AbortSignal;
}

export interface RpcArgs {
  signal: AbortSignal;
  request: RpcRequest;
}

export default abstract class EngineAbc {
  protected ee: TaskEmitter<EngineEventMap>;
  protected fmt: Formatter;

  private _conn: ConnectionInfo = {
    token: null,
    state: "closed",
    endpoint: null,
    database: null,
    namespace: null,
  };

  constructor(config: EngineAbcConfig) {
    this.ee = config.emitter;
    this.fmt = config.formatter;
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
    this._conn.namespace = ns;
  }

  get database(): string | null {
    return this._conn.database;
  }

  set database(db: string | null) {
    this._conn.database = db;
  }

  get token(): string | null {
    return this._conn.token;
  }

  set token(token: string | null) {
    this._conn.token = token;
  }

  getConnectionInfo(): ConnectionInfo {
    const conn = Object.assign({}, this._conn); // コピー

    if (conn.endpoint) {
      conn.endpoint = new URL(conn.endpoint); // コピー
    }

    return conn;
  }

  abstract readonly name: string;

  abstract connect(args: ConnectArgs): PromiseLike<void>;

  abstract close(args: CloseArgs): PromiseLike<void>;

  abstract rpc(args: RpcArgs): PromiseLike<RpcResponse>;
}
