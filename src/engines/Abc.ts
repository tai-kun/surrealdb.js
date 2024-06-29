import type { Simplify } from "type-fest";
import {
  collectErrors,
  type Err,
  err,
  type Ok,
  ok,
  type TaskEmitter,
} from "../_internal";
import {
  type EngineError,
  type HttpEngineError,
  StateTransitionError,
  type WebSocketEngineError,
} from "../common/errors";
import type {
  BidirectionalRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "../common/types";
import type { FormatterAbc } from "../formatters";
import type { ValidatorAbc } from "../validators";

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
export interface Connection {
  /**
   * 接続しているサーバーのエンドポイント。
   */
  endpoint?: URL;
  /**
   * 現在選択されている名前空間。
   */
  ns?: string;
  /**
   * 現在選択されているデータベース。
   */
  db?: string;
  /**
   * 現在認証されているトークン。
   */
  token?: string;
}

/**
 * エンジンのイベント。
 */
export type EngineEvents =
  & {
    // 状態遷移に関するイベント。
    [S in ConnectionState]: [
      result:
        // 状態遷移に成功した場合。
        | Ok<S>
        // 状態遷移に失敗した場合。
        | Err<unknown, { value: S }>,
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
export interface EngineConfig {
  /**
   * イベントエミッター。
   */
  readonly emitter: TaskEmitter<EngineEvents>;
  /**
   * クライアントとサーバー間で伝送されるデータのシリアライザーとデシリアライザー。
   */
  readonly formatter: FormatterAbc;
  /**
   * 各種データの検証を行うバリデータ-。
   */
  readonly validator: ValidatorAbc;
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
export default abstract class EngineAbc {
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
   * クライアントとサーバー間で伝送されるデータのシリアライザーとデシリアライザー。
   */
  protected fmt: FormatterAbc;

  /**
   * 各種データの検証を行うバリデータ-。
   */
  protected v8n: ValidatorAbc;

  /**
   * 接続情報。
   */
  protected conn: Connection = {};

  #state: ConnectionState = EngineAbc.CLOSED;

  /**
   * @param config - エンジンの設定。
   */
  constructor(config: EngineConfig) {
    this.ee = config.emitter;
    this.fmt = config.formatter;
    this.v8n = config.validator;
  }

  /**
   * 接続状態を変更します。
   *
   * @param state - 遷移先の状態。
   * @param fallback - 状態遷移に失敗した場合のフォールバック関数。
   * @example
   * ```typescript
   * await this.setState(CONNECTING, () => {
   *   console.error("接続に失敗しました。");
   *
   *   return CLOSED; // 失敗したため、現在の接続状態を切断済みとします。
   * });
   *
   * console.log("接続に成功しました。");
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
   * 現在の接続状態。
   *
   * - `0` 接続中
   * - `1` 接続済み
   * - `2` 切断中
   * - `3` 切断済み
   */
  get state(): ConnectionState {
    return this.#state;
  }

  /**
   * 接続情報。この接続情報は参照されるたびにコピーされます。
   * そのため、実装されたメソッドを回避してこれを変更することはできません。
   *
   * @example
   * ```typescript
   * const conn = engine.connection;
   * console.log(`接続先: ${conn.endpoint}`);
   *
   * // ⚠ この操作はエンジンの接続情報に影響を与えません。
   * conn.endpoint = new URL("http://localhost:8080");
   * ```
   */
  get connection(): Connection {
    const conn = { ...this.conn }; // copy

    if (conn.endpoint) {
      conn.endpoint = new URL(conn.endpoint); // copy
    }

    return conn;
  }

  /**
   * 指定されたエンドポイントに接続します。
   *
   * @param endpoint - 接続先のエンドポイント。
   * @param signal - 接続の中断に使用するシグナル。
   * @example
   * ```typescript
   * await engine.connect(new URL("ws://localhost:8080"));
   * ```
   */
  abstract connect(endpoint: URL, signal: AbortSignal): Promise<void>;

  /**
   * サーバーとの接続を切ります。
   *
   * @param signal - 切断の中断に使用するシグナル。
   * @returns　切断の結果。
   * @example
   * ```typescript
   * const result = await engine.disconnect();
   *
   * if (result.ok) {
   *   console.log(`成功の理由: ${result.value}`);
   * } else {
   *   throw result.error;
   * }
   */
  abstract disconnect(signal: AbortSignal): Promise<
    | Ok<"Disconnected">
    | Ok<"AlreadyDisconnected">
    | Err<unknown>
  >;

  /**
   * サーバーに RPC リクエストを送信します。
   *
   * @param request - 送信する RPC リクエスト。
   * @param signal - リクエストの中断に使用するシグナル。
   * @returns RPC レスポンス。
   * @example
   * ```typescript
   * const response = await engine.rpc(
   *   { mwthod: "ping", params: [] },
   *   AbortSignal.timeout(5_000), // 5 秒でタイムアウト
   * );
   * ```
   */
  abstract rpc(request: RpcRequest, signal: AbortSignal): Promise<RpcResponse>;
}
