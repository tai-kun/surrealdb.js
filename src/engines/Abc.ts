import type { Simplify } from "type-fest";
import { type EngineError, StateTransitionError } from "../errors";
import type { FormatterAbc } from "../formatters";
import {
  collectErrors,
  type Err,
  err,
  type Ok,
  ok,
  type TaskEmitter,
} from "../internal";
import type {
  BidirectionalRpcResponse,
  LiveResult,
  RpcRequest,
  RpcResponse,
} from "../types";
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
 * 接続情報
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
 * 一般的なエンジンのエラー。
 */
export interface GeneralEngineError<T extends string = string> {
  name: T;
  message: string;
}

/**
 * エンジンのイベント。
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
 * クライアントエンジンの抽象クラス。
 */
export default abstract class EngineAbc {
  static readonly CONNECTING = 0 as const satisfies ConnectionState;

  static readonly OPEN = 1 as const satisfies ConnectionState;

  static readonly CLOSING = 2 as const satisfies ConnectionState;

  static readonly CLOSED = 3 as const satisfies ConnectionState;

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
   */
  get state(): ConnectionState {
    return this.#state;
  }

  /**
   * 接続情報。この接続情報は参照されるたびにコピーされます。
   * そのため、実装されたメソッドを回避してこれを変更することはできません。
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
   */
  abstract connect(endpoint: URL): Promise<void>;

  /**
   * サーバーとの接続を切断します。
   *
   * @returns　切断の結果。
   */
  abstract disconnect(): Promise<
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
   */
  abstract rpc(request: RpcRequest, signal: AbortSignal): Promise<RpcResponse>;
}
