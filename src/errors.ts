import type {
  BidirectionalRpcResponseErr,
  IdLessRpcResponseErr,
} from "./common/types";

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
 * このエラーは、主に値が期待された型と異なる場合に投げられます。
 */
export class TypeError extends SurrealDbError {
  static {
    this.prototype.name = "TypeError";
  }
}

/**
 * このエラーは、サポートされていないランタイムを使用していると判断された場合に投げられます。
 *
 * This error is thrown when an unsupported runtime is detected.
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
 * This error is thrown when a circular reference occurs between protocols.
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
 * This error is thrown when attempting to connect using an unsupported protocol.
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
 *
 * This error is thrown when converting data fails.
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
 *
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

export interface EngineErrorOptions extends ErrorOptions {
  /**
   * このエラーが致命的であるかどうか。
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
 * このエラーは、WebSocket エンジンに起因する問題が発生した場合に投げられます。
 */
export class WebSocketEngineError extends EngineError {
  static {
    this.prototype.name = "WebSocketEngineError";
  }

  /**
   * エラーコード。
   *
   * @see https://developer.mozilla.org/ja/docs/Web/API/WebSocket/close#code
   */
  code: number;

  /**
   * @param code - エラーコード。
   * @param message - エラーメッセージ。
   * @param options - エラーオプション。
   */
  constructor(
    code: number,
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
 * 例えば `.connect()` のようなメソッドが事前に呼び出されていない可能性があります。
 * なお、非同期処理のタイミングの問題により、稀にこのエラーが発生することがあります。
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
