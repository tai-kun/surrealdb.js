import type {
  BidirectionalRpcResponseErr,
  IdLessRpcResponseErr,
} from "./index/types";

/**
 * このパッケージがハンドリングするエラーが継承するエラークラス。
 */
export class SurrealDbError extends Error {}

/**
 * このエラーは、到達不能なコードに到達した場合に投げられます。
 */
export class UnreachableError extends SurrealDbError {
  static {
    this.prototype.name = "UnreachableError";
  }

  /**
   * @param options - エラーオプション。
   */
  constructor(options?: ErrorOptions | undefined) {
    super("Unreachable code reached.", options);
  }
}

/**
 * 到達不能であることを示します。
 *
 * @throws {UnreachableError}
 */
export function unreachable(): never;

/**
 * 到達不能であることを示します。
 *
 * @param cause - 到達不能の原因。
 * @throws {UnreachableError}
 */
export function unreachable(cause: never): never;

export function unreachable(...args: [cause?: never]): never {
  if (args.length === 0) {
    throw new UnreachableError();
  } else {
    throw new UnreachableError({ cause: args[0] });
  }
}

/**
 * このエラーは、値が期待された型と異なる場合に投げられます。
 * バリデーターや埋め込まれた検証がこのエラーを投げるため、あらゆる場所でこのエラーを捕捉する可能性があります。
 */
export class SurrealDbTypeError extends SurrealDbError {
  static {
    this.prototype.name = "SurrealDbTypeError";
  }
}

/**
 * このエラーは、サポートされていないランタイムを使用していると判断された場合に投げられます。
 */
export class UnsupportedRuntime extends SurrealDbError {
  static {
    this.prototype.name = "UnsupportedRuntime";
  }

  /**
   * @param reason - 判断の理由。
   * @param options - エラーオプション。
   */
  constructor(reason: string, options?: ErrorOptions | undefined) {
    super("Unsupported runtime. " + reason, options);
  }
}

/**
 * このエラーは、プロトコル間で循環参照が発生した場合に投げられます。
 *
 * @example
 * ```ts
 * // この例では、https プロトコルのエンジンが http に設定されているエンジンを使うことを示しているにもかかわらず、http プロトコルのエンジンは https に設定されているエンジンを使おうとするため、循環参照エラーが投げられます。
 *
 * const { Surreal } = initSurreal({
 *   engines: {
 *     http: "https",
 *     https: "http",
 *   },
 *   // その他の設定
 * });
 *
 * try {
 *   await using db = new Surreal();
 *   await db.connect("https://localhost:8000")
 * } catch (error) {
 *   console.error(error); // CircularEngineReference: Circular engine reference: http,https
 * }
 * ```
 */
export class CircularEngineReference extends SurrealDbError {
  static {
    this.prototype.name = "CircularEngineReference";
  }

  /**
   * @param seen - 参照されたプロトコルのリスト。
   * @param options - エラーオプション。
   */
  constructor(seen: Iterable<string>, options?: ErrorOptions | undefined) {
    super(`Circular engine reference: ${[...seen]}`, options);
  }
}

/**
 * このエラーは、サポートされていないプロトコルを使用しようとした場合に投げられます。
 *
 * @example
 * ```ts
 * // この例では、HTTP エンジンを http プロトコルにのみ設定しているため、https で接続しようとするとエラーが投げられます。
 *
 * const { Surreal } = initSurreal({
 *   engines: {
 *     http: httpEngine,
 *   },
 *   // その他の設定
 * });
 *
 * try {
 *   await using db = new Surreal();
 *   await db.connect("https://localhost:8000");
 * } catch (error) {
 *   console.error(error); // UnsupportedProtocol: Unsupported protocol: https
 * }
 * ```
 */
export class UnsupportedProtocol extends SurrealDbError {
  static {
    this.prototype.name = "UnsupportedProtocol";
  }

  /**
   * @param protocol - サポートされていないプロトコル。
   * @param options - エラーオプション。
   */
  constructor(protocol: string, options?: ErrorOptions | undefined) {
    super(`Unsupported protocol: ${protocol}`, options);
  }
}

/**
 * このエラーは、データの変換に失敗した場合に投げられます。
 * 現在は `Payload` クラスがレスポンスボディを ArrayBuffer への変換に失敗したときにのみ投げられます。
 * そのため、このエラーはフォーマッターがレスポンスボディを JavaScript の値にデコードするのに失敗したことを意味します。
 */
export class DataConversionFailure extends SurrealDbError {
  static {
    this.prototype.name = "DataConversionFailure";
  }

  /**
   * @param from - 変換元のデータ型。
   * @param to - 変換先のデータ型。
   * @param source - エラーの原因となったデータ。
   * @param options - エラーオプション。
   */
  constructor(
    from: string,
    to: string,
    public source: unknown,
    options?: ErrorOptions | undefined,
  ) {
    super(`Failed to convert the data from ${from} to ${to}.`, options);
  }
}

/**
 * このエラーは、タスクが失敗した場合に投げられます。
 * これは主に、イベントハンドラーがエラーを投げたことを意味します。
 */
export class AggregateTasksError extends SurrealDbError {
  static {
    this.prototype.name = "AggregateTasksError";
  }

  /**
   * @param errors - 失敗したタスクのリスト。
   */
  constructor(errors: readonly unknown[]) {
    super(`${errors.length} task(s) failed.`, { cause: errors });
  }
}

/**
 * このエラーは、リソースがすでに破棄されてる場合に投げられます。
 * これは、非同期タスクを管理するクラスなどがすでにその役目を終えていることを意味します。
 */
export class ResourceAlreadyDisposed extends SurrealDbError {
  static {
    this.prototype.name = "ResourceAlreadyDisposed";
  }

  /**
   * @param name - 破棄されたリソースの名前。
   * @param options - エラーオプション。
   */
  constructor(name: string, options?: ErrorOptions | undefined) {
    super(`The resource "${name}" has been disposed.`, options);
  }
}

/**
 * エンジンに起因するエラーのクラスのオプション。
 */
export interface EngineErrorOptions extends ErrorOptions {
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
export class EngineError extends SurrealDbError {
  static {
    this.prototype.name = "EngineError";
  }

  /**
   * このエラーが致命的であるかどうか。
   */
  fatal: boolean | undefined;

  /**
   * @param message - エラーメッセージ。
   * @param options - エラーオプション。
   */
  constructor(message: string, options?: EngineErrorOptions | undefined) {
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
   * @param message - エラーメッセージ。
   * @param options - エラーオプション。
   */
  constructor(message: string, options?: EngineErrorOptions | undefined) {
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
  | WebSocketEngineErrorCode.Custom
  | WebSocketEngineErrorCode.Defined;

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
   * @param code - エラーコード。
   * @param message - エラーメッセージ。
   * @param options - エラーオプション。
   */
  constructor(
    code: WebSocketEngineErrorCode,
    message: string,
    options?: EngineErrorOptions | undefined,
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
 *   console.error(error); // StateTransitionError: Failed to transition from "3" to "0".
 * }
 * ```
 */
export class StateTransitionError extends SurrealDbError {
  static {
    this.prototype.name = "StateTransitionError";
  }

  /**
   * @param from - 現在の状態。
   * @param to - 遷移先の状態。
   * @param options - エラーオプション。
   */
  constructor(
    from: { readonly toString: () => string },
    to: { readonly toString: () => string },
    options?: ErrorOptions | undefined,
  ) {
    super(`Failed to transition from "${from}" to "${to}".`, options);
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
export class ConnectionUnavailable extends SurrealDbError {
  static {
    this.prototype.name = "ConnectionUnavailable";
  }

  /**
   * @param options - エラーオプション。
   */
  constructor(options?: ErrorOptions | undefined) {
    super("The connection is unavailable.", options);
  }
}

/**
 * このエラーは、データベースを指定する前に名前空間が指定されていない場合に投げられます。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 * await db.connect("http://localhost:8000");
 *
 * try {
 *   await db.use({ database: "example" });
 * } catch (error) {
 *   console.error(error); // MissingNamespace: The namespace must be specified before the database.
 * }
 * ```
 */
export class MissingNamespace extends SurrealDbError {
  static {
    this.prototype.name = "MissingNamespace";
  }

  /**
   * @param options - エラーオプション。
   */
  constructor(options?: ErrorOptions | undefined) {
    super("The namespace must be specified before the database.", options);
  }
}

/**
 * このエラーは、レスポンスが不正な値のときに投げられます。
 * HTTP エンジンに設定したカスタム fetch のレスポンスの実装に誤りがあるか、レスポンスがステータスコード 200 以外を示しています。
 */
export class InvalidResponse extends SurrealDbError {
  static {
    this.prototype.name = "InvalidResponse";
  }

  /**
   * @param message - エラーメッセージ。
   * @param options - エラーオプション。
   */
  constructor(message: string, options?: ErrorOptions | undefined) {
    super(message, options);
  }
}

/**
 * このエラーは RPC レスポンスがエラーを示した場合に投げられます。
 * 接続したプロトコルによる通信やレスポンスボディのデコードなどに問題はありませんが、SurrealDB が RPC リクエストを処理できないことを意味します。
 */
export class RpcResponseError extends SurrealDbError {
  static {
    this.prototype.name = "RpcResponseError";
  }

  /**
   * RPC リクエストを識別する ID。
   */
  id?: BidirectionalRpcResponseErr["id"] | undefined;

  /**
   * エラーコード。
   * SurrealDB のドキュメントに明記されていませんが、おそらく JSON-RPC のエラーコードだと思われます。
   *
   * @see https://www.jsonrpc.org/specification#error_object
   */
  code: BidirectionalRpcResponseErr["error"]["code"];

  /**
   * @param response - RPC レスポンス。
   * @param options - エラーオプション。
   */
  constructor(
    response: IdLessRpcResponseErr | BidirectionalRpcResponseErr,
    options?: ErrorOptions | undefined,
  ) {
    super(response.error.message, options);
    this.code = response.error.code;

    if ("id" in response) {
      this.id = response.id;
    }
  }
}

/**
 * このエラーは、クエリーが失敗した場合に投げられます。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 * await db.connect("http://localhost:8000");
 *
 * try {
 *   await db.query("OUTPUT 'Hello'");
 * } catch (error) {
 *   console.error(error); // QueryFailure: Query failed with 1 error(s)
 *   console.error(...error.cause);
 * }
 * ```
 */
export class QueryFailure extends SurrealDbError {
  static {
    this.prototype.name = "QueryFailure";
  }

  /**
   * @param errors - エラーメッセージ。
   */
  constructor(errors: readonly string[]) {
    super(`Query failed with ${errors.length} error(s)`, {
      cause: errors,
    });
  }
}

/**
 * このエラーは、クライアントが複数のエンドポイントに同時に接続しようとした場合に投げられます。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 *
 * try {
 *   await db.connect("http://localhost:8000");
 *   await db.connect("http://localhost:11298");
 * } catch (error) {
 *   console.error(error); // ConnectionConflict: Connection conflict between http://localhost:8000/rpc and http://localhost:11298/rpc.
 * }
 * ```
 */
export class ConnectionConflict extends SurrealDbError {
  static {
    this.prototype.name = "ConnectionConflict";
  }

  /**
   * @param endpoint1 - 一方のエンドポイント。
   * @param endpoint2 - もう一方のエンドポイント。
   * @param options - エラーオプション。
   */
  constructor(
    endpoint1: unknown,
    endpoint2: unknown,
    options?: ErrorOptions | undefined,
  ) {
    super(
      `Connection conflict between ${endpoint1} and ${endpoint2}.`,
      options,
    );
  }
}

/**
 * このエラーは、接続が強制的に終了されたことを示します。
 * これは AbortSignal を介して取得されるエラーであり、
 * これを認識するタスクは現在の操作を即座に停止する必要があります。
 *
 * @example
 * ```ts
 * const db = new Surreal();
 *
 * db.on(<イベント>, ({ signal }) => {
 *   signal.addEventListener("abort", function() {
 *     console.error(this.reason); // EngineDisconnected: The engine is disconnected.
 *   })
 * });
 *
 * await db.disconnect({ force: true }); // force を true にすると中止シグナルにエラーが送信されます。
 * ```
 */
export class EngineDisconnected extends SurrealDbError {
  static {
    this.prototype.name = "EngineDisconnected";
  }

  /**
   * @param options - エラーオプション。
   */
  constructor(options?: ErrorOptions | undefined) {
    super("The engine is disconnected.", options);
  }
}

/**
 * このエラーは、CBOR タグが未知である場合に投げられます。
 */
export class UnknownCborTag extends SurrealDbError {
  static {
    this.prototype.name = "UnknownCborTag";
  }

  /**
   * @param tag - 未知の CBOR タグ。
   * @param options - エラーオプション。
   */
  constructor(tag: number | bigint, options?: ErrorOptions | undefined) {
    super(`Unknown CBOR tag: ${tag}`, options);
  }
}
