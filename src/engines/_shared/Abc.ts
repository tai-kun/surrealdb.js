import {
  type EngineError,
  type HttpEngineError,
  StateTransitionError,
  type WebSocketEngineError,
} from "@tai-kun/surreal/errors";
import type { Formatter } from "@tai-kun/surreal/formatters";
import type {
  BidirectionalRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "@tai-kun/surreal/types";
import { collectErrors, type TaskEmitter } from "@tai-kun/surreal/utils";
import type { Validator } from "@tai-kun/surreal/validators";
import type { SetOptional, Simplify } from "type-fest";

/**
 * null の場合はオプションにする。
 *
 * @template T オブジェクトの型。
 */
type OptionalOnNull<T> = SetOptional<
  T,
  {
    [P in keyof T]: null extends T[P] ? P : never;
  }[keyof T]
>;

/**
 * null を持たないキーを取り出す。
 *
 * @template T オブジェクトの型。
 */
type NonNullKeysOf<T> = {
  [P in keyof T]: null extends T[P] ? never : P;
}[keyof T];

/**
 * 現在の接続状態。
 *
 * - `0` CONNECTING
 * - `1` OPEN
 * - `2` CLOSING
 * - `3` CLOSED
 */
export type ConnectionState = 0 | 1 | 2 | 3;

/**
 * 接続情報。
 */
export namespace ConnectionInfo {
  interface Info<
    S extends ConnectionState,
    E,
    N,
    D,
    T,
  > {
    /**
     * 現在の接続状態。
     *
     * - `0` CONNECTING
     * - `1` OPEN
     * - `2` CLOSING
     * - `3` CLOSED
     */
    state: S;
    /**
     * 接続しているサーバーのエンドポイント。
     * 切断状態では null です。
     */
    endpoint: E;
    /**
     * 現在選択されている名前空間。
     * 接続が確立していないか、名前空間を切り替えていない場合は null です。
     */
    ns: N;
    /**
     * 現在選択されているデータベース。
     * 接続が確立していないか、データベースを切り替えていない場合は null です。
     */
    db: D;
    /**
     * 現在認証されているトークン。
     * 接続が確立していないか、認証していない場合は null です。
     */
    token: T;
  }

  /**
   * 接続中の情報。
   */
  export interface Connecting extends
    Info<
      0,
      URL,
      null,
      null,
      null
    >
  {}

  /**
   * 接続完了後の情報。
   */
  export interface Open extends
    Info<
      1,
      URL,
      string | null,
      string | null,
      string | null
    >
  {}

  /**
   * 切断中の情報。
   */
  export interface Closing extends
    Info<
      2,
      URL,
      string | null,
      string | null,
      string | null
    >
  {}

  /**
   * 切断後または接続前の情報。
   */
  export interface Closed extends
    Info<
      3,
      null,
      null,
      null,
      null
    >
  {}
}

/**
 * 接続情報。
 */
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

/**
 * @internal
 */
export type TransitionArgs = {
  [S in ConnectionState]: _TransitionArgs<
    S,
    Extract<ConnectionInfo, { state: S }>
  >;
}[ConnectionState];

/**
 * @internal
 */
const transArgsToConnInfo = (args: TransitionArgs): ConnectionInfo => {
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
};

/**
 * エンジンのイベント。
 */
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
    [_: `rpc/${BidirectionalRpcResponse["id"]}`]: [response: RpcResponse];
    // ライブクエリーの結果のイベント。
    [_: `live/${string}`]: [response: Simplify<Omit<LiveResult, "id">>];
    // エンジン内エラーを通知するイベント。
    error: [error: EngineError | HttpEngineError | WebSocketEngineError];
  };

/**
 * エンジンの設定。
 */
export interface EngineAbcConfig {
  /**
   * イベントエミッター。
   */
  readonly emitter: TaskEmitter<EngineEvents>;
  /**
   * クライアントとサーバー間で伝送されるデータのエンコーダーとデコーダー。
   */
  readonly formatter: Formatter;
  /**
   * 各種データの検証を行うバリデータ-。
   */
  readonly validator: Validator;
}

/**
 * 現在の接続状態が、接続中であることを示します。
 */
export const CONNECTING = 0 as const satisfies ConnectionState;

/**
 * 現在の接続状態が、接続済みであることを示します。
 */
export const OPEN = 1 as const satisfies ConnectionState;

/**
 * 現在の接続状態が、切断中であることを示します。
 */
export const CLOSING = 2 as const satisfies ConnectionState;

/**
 * 現在の接続状態が、切断済みであることを示します。
 */
export const CLOSED = 3 as const satisfies ConnectionState;

/**
 * クライアントエンジンの抽象クラス。
 */
export abstract class EngineAbc {
  /**
   * 現在の接続状態が、接続中であることを示します。
   */
  static readonly CONNECTING = CONNECTING;

  /**
   * 現在の接続状態が、接続済みであることを示します。
   */
  static readonly OPEN = OPEN;

  /**
   * 現在の接続状態が、切断中であることを示します。
   */
  static readonly CLOSING = CLOSING;

  /**
   * 現在の接続状態が、切断済みであることを示します。
   */
  static readonly CLOSED = CLOSED;

  /**
   * イベントエミッター。エンジン内でこのインスタンスを破棄しないでください。
   */
  protected ee: TaskEmitter<EngineEvents>;

  /**
   * クライアントとサーバー間で伝送されるデータのエンコーダーとデコーダー。
   */
  protected fmt: Formatter;

  /**
   * 各種データの検証を行うバリデータ-。
   */
  protected v8n: Validator;

  /**
   * 接続情報。
   */
  private _conn: ConnectionInfo = {
    ns: null,
    db: null,
    token: null,
    state: CLOSED,
    endpoint: null,
  };

  /**
   * @param config エンジンの設定。
   */
  constructor(config: EngineAbcConfig) {
    this.ee = config.emitter;
    this.fmt = config.formatter;
    this.v8n = config.validator;
  }

  /**
   * 接続状態を変更します。
   *
   * @param state 遷移先の接続状態とその初期情報。
   * @param fallback 状態遷移に失敗した場合のフォールバック関数。
   * @example
   * ```ts
   * await this.transition(
   *   {
   *     state: CONNECTING,
   *     endpoint: new URL("..."),
   *   },
   *   () => {
   *     console.error("接続に失敗しました。");
   *     return CLOSED; // 失敗したため、現在の接続状態を切断済みとします。
   *   }
   * );
   *
   * console.log("接続に成功しました。");
   * ```
   */
  protected async transition(
    args: TransitionArgs,
    fallback: () => TransitionArgs,
  ): Promise<void> {
    this._conn = transArgsToConnInfo(args);

    const fromState = this.state;
    const toState = this._conn.state;
    const hooks = this.ee.emit(toState, {
      state: toState as never,
    });

    if (hooks && hooks.length) {
      const errors = await collectErrors(hooks);

      if (errors.length) {
        const args = fallback();
        this._conn = transArgsToConnInfo(args);

        throw new StateTransitionError(
          fromState,
          toState,
          this._conn.state,
          {
            cause: errors,
          },
        );
      }
    }
  }

  /**
   * 現在の接続状態。
   *
   * - `0` 接続中
   * - `1` 接続済み
   * - `2` 切断中
   * - `3` 切断済み
   */
  get state(): ConnectionState {
    return this._conn.state;
  }

  /**
   * 接続しているサーバーのエンドポイント。
   * 切断状態では null です。
   */
  get endpoint(): URL | null {
    return this._conn.endpoint && new URL(this._conn.endpoint); // コピー
  }

  /**
   * 現在選択されている名前空間。
   * 接続が確立していないか、名前空間を切り替えていない場合は null です。
   */
  get namespace(): string | null {
    return this._conn.ns;
  }

  set namespace(ns: string | null) {
    if (this._conn.state === OPEN) {
      this._conn.ns = ns;
    }
  }

  /**
   * 現在選択されているデータベース。
   * 接続が確立していないか、データベースを切り替えていない場合は null です。
   */
  get database(): string | null {
    return this._conn.db;
  }

  set database(db: string | null) {
    if (this._conn.state === OPEN) {
      this._conn.db = db;
    }
  }

  /**
   * 現在認証されているトークン。
   * 接続が確立していないか、認証していない場合は null です。
   */
  get token(): string | null {
    return this._conn.token;
  }

  set token(token: string | null) {
    if (this._conn.state === OPEN) {
      this._conn.token = token;
    }
  }

  /**
   * 接続情報。この接続情報は参照されるたびにコピーされます。
   * そのため、実装されたメソッドを回避してこれを変更することはできません。
   *
   * @example
   * ```ts
   * const conn = engine.getConnectionInfo();
   * console.log(`接続先: ${conn.endpoint}`);
   *
   * // ⚠ この操作はエンジンの接続情報に影響を与えません。
   * conn.endpoint = new URL("http://localhost:8080");
   * ```
   */
  getConnectionInfo(): ConnectionInfo {
    const conn = { ...this._conn }; // コピー

    if (conn.endpoint) {
      conn.endpoint = new URL(conn.endpoint); // コピー
    }

    return conn;
  }

  /**
   * 指定されたエンドポイントに接続します。
   *
   * @param endpoint 接続先のエンドポイント。
   * @param signal 接続の中断に使用するシグナル。
   * @example
   * ```ts
   * await engine.connect(new URL("ws://localhost:8080"));
   * ```
   */
  abstract connect(endpoint: URL, signal: AbortSignal): Promise<void>;

  /**
   * サーバーとの接続を切ります。
   *
   * @param signal 切断の中断に使用するシグナル。
   * @example
   * ```ts
   * try {
   *   await engine.disconnect()
   *   console.log("切断に成功しました。");
   * } catch (error) {
   *   console.error(error);
   * }
   * ```
   */
  abstract disconnect(signal: AbortSignal): Promise<void>;

  /**
   * サーバーに RPC リクエストを送信します。
   *
   * @param request 送信する RPC リクエスト。
   * @param signal リクエストの中断に使用するシグナル。
   * @returns RPC レスポンス。
   * @example
   * ```ts
   * const response = await engine.rpc(
   *   { mwthod: "ping", params: [] },
   *   AbortSignal.timeout(5_000), // 5 秒でタイムアウト
   * );
   * ```
   */
  abstract rpc(request: RpcRequest, signal: AbortSignal): Promise<RpcResponse>;
}
