import { SurrealError, type SurrealErrorOptions } from "./shared";

/**
 * エンジンに起因するエラーのクラスのオプション。
 */
export interface EngineSurrealErrorOptions extends SurrealErrorOptions {
  /**
   * このエラーが致命的であるかどうか。
   *
   * @default undefined
   */
  readonly fatal?: boolean | undefined;
}

/**
 * このエラーは、エンジンに起因する問題が発生した場合に投げられます。
 */
export class EngineError extends SurrealError {
  static {
    this.prototype.name = "EngineError";
  }

  /**
   * このエラーが致命的であるかどうか。
   */
  fatal: boolean | undefined;

  /**
   * @param message エラーメッセージ。
   * @param options エラーオプション。
   */
  constructor(
    message: string,
    options?: EngineSurrealErrorOptions | undefined,
  ) {
    super(message, options);
    this.fatal = options?.fatal;
  }
}

/**
 * このエラーは、HTTP エンジンに起因する問題が発生した場合に投げられます。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 *
 * db.on("error", error => {
 *   console.error(error); // HttpEngineError: <メッセージ>
 * });
 *
 * await db.connect("http://localhost:8000");
 * // 何らかのエラーが発生する処理
 * ```
 */
export class HttpEngineError extends EngineError {
  static {
    this.prototype.name = "HttpEngineError";
  }

  /**
   * @param message エラーメッセージ。
   * @param options エラーオプション。
   */
  constructor(
    message: string,
    options?: EngineSurrealErrorOptions | undefined,
  ) {
    super(message, options);
  }
}

/**
 * WebSocket エンジンに起因する問題のエラーコード。
 */
export namespace WebSocketEngineErrorCode {
  /**
   * 標準のエラーコード。
   */
  export type Defined =
    // | 1000
    // | 1004
    // | 1005
    // | 1001
    // | 1006
    | 1002
    | 1003
    | 1007
    | 1008
    | 1009
    | 1010
    | 1011
    | 1012
    | 1013
    | 1014
    | 1015;

  /**
   * カスタムのエラーコード。
   */
  export type Custom =
    | 3000
    | 3001
    | 3002
    | 3003;
}

/**
 * WebSocket エンジンに起因する問題のエラーコード。
 *
 * 早期切断に由来する標準のエラーコードはエラーとして扱われません。
 *
 * カスタムのエラーコード:
 *
 * - `3000`: error イベントを捕捉したことを示します。
 * - `3001`: open イベントハンドラー内でエラーが発生したことを示します。
 *    これは `OPEN` イベントハンドラーのどれかがエラーを投げ、{@link StateTransitionError} が発生したことを意味します。
 * - `3002`: message イベントハンドラー内でエラーが発生したことを示します。
 *    レスポンスボディの検証に関する原因が考えられます。
 *    通常 RPC はタイムアウトエラーで自己完結するため、直ちにエンドポイントとの接続を切る必要はありませんが、ログは記録するべきです。
 * - `3003`: ping メッセージの送信に失敗したことを示します。この ping は WebSocket の ping メッセージではなく、SurrealDB の ping RPC です。
 *
 * @see https://developer.mozilla.org/ja/docs/Web/API/WebSocket/close#code
 */
export type WebSocketEngineErrorCode =
  | WebSocketEngineErrorCode.Defined
  | WebSocketEngineErrorCode.Custom;

/**
 * このエラーは、WebSocket エンジンに起因する問題が発生した場合に投げられます。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 *
 * db.on("error", error => {
 *   console.error(error); // WebSocketEngineError: <メッセージ>
 * });
 *
 * await db.connect("ws://localhost:8000");
 * // 何らかのエラーが発生する処理
 * ```
 */
export class WebSocketEngineError extends EngineError {
  static {
    this.prototype.name = "WebSocketEngineError";
  }

  /**
   * エラーコード。
   */
  code: WebSocketEngineErrorCode;

  /**
   * @param code エラーコード。
   * @param message エラーメッセージ。
   * @param options エラーオプション。
   */
  constructor(
    code: WebSocketEngineErrorCode,
    message: string,
    options?: EngineSurrealErrorOptions | undefined,
  ) {
    super(message, options);
    this.code = code;
  }
}

/**
 * このエラーは、エンジンが内部状態の遷移に失敗した場合に投げられます。
 * これは主に、接続状態間の切り替え時に、その状態の変化を監視するコールバック関数がエラーを投げた場合に発生します。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 *
 * db.on(CONNECTING, () => {
 *   throw new Error("絶対接続させません。");
 * });
 *
 * try {
 *   await db.connect("http://localhost:8000");
 * } catch (error) {
 *   console.error(error); // StateTransitionError: The transition from `3` to `0` failed, falling back to `3`.
 * }
 * ```
 */
export class StateTransitionError extends SurrealError {
  static {
    this.prototype.name = "StateTransitionError";
  }

  /**
   * @param from 現在の状態。
   * @param to 遷移先の状態。
   * @param fallback フォールバック先の状態。
   * @param options エラーオプション。
   */
  constructor(
    from: number,
    to: number,
    fallback: number,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(
      `The transition from \`${from}\` to \`${to}\` failed, `
        + `falling back to \`${fallback}\`.`,
      options,
    );
  }
}

/**
 * このエラーは、エンジンが接続可能でない場合に投げられます。
 * これは主に、エンドポイントへの接続がまだ開始されていない場合に発生します。
 * 接続が進行中の場合、一般的にはその完了を待機するため、このエラーは発生しません。
 * 例えば `.connect()` メソッドが事前に呼び出されていない可能性があります。
 * なお、非同期処理のタイミングの問題により、稀にこのエラーが発生することがあります。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 * // await db.connect("ws://localhost:8000");
 *
 * try {
 *   await db.ping();
 * } catch (error) {
 *   console.error(error); // ConnectionUnavailable: The connection is unavailable.
 * }
 * ```
 */
export class ConnectionUnavailable extends SurrealError {
  static {
    this.prototype.name = "ConnectionUnavailable";
  }

  /**
   * @param options エラーオプション。
   */
  constructor(options?: SurrealErrorOptions | undefined) {
    super("The connection is unavailable.", options);
  }
}

/**
 * このエラーは、レスポンスが不正な値のときに投げられます。
 * HTTP エンジンに設定したカスタム fetch のレスポンスの実装に誤りがあるか、レスポンスがステータスコード 200 以外を示しています。
 */
export class InvalidResponse extends SurrealError {
  static {
    this.prototype.name = "InvalidResponse";
  }

  /**
   * @param message エラーメッセージ。
   * @param options エラーオプション。
   */
  constructor(message: string, options?: SurrealErrorOptions | undefined) {
    super(message, options);
  }
}
