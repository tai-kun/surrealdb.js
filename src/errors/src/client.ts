import type {
  BidirectionalRpcResponseErr,
  IdLessRpcResponseErr,
} from "@tai-kun/surreal/types";
import type { Jsonifiable } from "type-fest";
import {
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
} from "./shared";

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
export class CircularEngineReference extends SurrealError {
  static {
    this.prototype.name = "CircularEngineReference";
  }

  /**
   * @param seen 参照されたプロトコルのリスト。
   * @param options エラーオプション。
   */
  constructor(
    seen: Iterable<string>,
    options?: SurrealErrorOptions | undefined,
  ) {
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
export class UnsupportedProtocol extends SurrealError {
  static {
    this.prototype.name = "UnsupportedProtocol";
  }

  /**
   * @param protocol サポートされていないプロトコル。
   * @param options エラーオプション。
   */
  constructor(protocol: string, options?: SurrealErrorOptions | undefined) {
    super(`Unsupported protocol: ${protocol}`, options);
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
 *   console.error(error); // ConnectionConflict: Connection conflict between "http://localhost:8000/rpc" and "http://localhost:11298/rpc".
 * }
 * ```
 */
export class ConnectionConflict extends SurrealError {
  static {
    this.prototype.name = "ConnectionConflict";
  }

  /**
   * @param endpoint1 一方のエンドポイント。
   * @param endpoint2 もう一方のエンドポイント。
   * @param options エラーオプション。
   */
  constructor(
    endpoint1: Jsonifiable,
    endpoint2: Jsonifiable,
    options?: SurrealErrorOptions | undefined,
  ) {
    endpoint1 = JSON.stringify(endpoint1);
    endpoint2 = JSON.stringify(endpoint2);
    super(
      `Connection conflict between ${endpoint1} and ${endpoint2}.`,
      options,
    );
  }
}

/**
 * このエラーは、クライアントが同時に異なる複数の名前空間に切り替えようとした場合に投げられます。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 *
 * try {
 *   await db.connect("http://localhost:8000");
 *   await db.use({ namespace: "baz" });
 *   await Promise.all([
 *     db.use({ namespace: "foo" }),
 *     db.use({ namespace: "bar" }),
 *   ]);
 * } catch (error) {
 *   console.error(error); // ConnectionConflict: Namespace conflict between "foo" and "bar".
 * }
 * ```
 */
export class NamespaceConflict extends SurrealError {
  static {
    this.prototype.name = "NamespaceConflict";
  }

  /**
   * @param namespace1 一方の名前空間。
   * @param namespace2 もう一方の名前空間。
   * @param options エラーオプション。
   */
  constructor(
    namespace1: Jsonifiable,
    namespace2: Jsonifiable,
    options?: SurrealErrorOptions | undefined,
  ) {
    namespace1 = JSON.stringify(namespace1);
    namespace2 = JSON.stringify(namespace2);
    super(
      `Namespace conflict between ${namespace1} and ${namespace2}.`,
      options,
    );
  }
}

/**
 * このエラーは、クライアントが同時に異なる複数の名前空間に切り替えようとした場合に投げられます。
 *
 * @example
 * ```ts
 * await using db = new Surreal();
 *
 * try {
 *   await db.connect("http://localhost:8000");
 *   await db.use({ namespace: "foo", database: "baz" });
 *   await Promise.all([
 *     db.use({ database: "foo" }),
 *     db.use({ database: "bar" }),
 *   ]);
 * } catch (error) {
 *   console.error(error); // ConnectionConflict: Database conflict between "foo" and "bar".
 * }
 * ```
 */
export class DatabaseConflict extends SurrealError {
  static {
    this.prototype.name = "DatabaseConflict";
  }

  /**
   * @param database1 一方の名前空間。
   * @param database2 もう一方の名前空間。
   * @param options エラーオプション。
   */
  constructor(
    database1: Jsonifiable,
    database2: Jsonifiable,
    options?: SurrealErrorOptions | undefined,
  ) {
    database1 = JSON.stringify(database1);
    database2 = JSON.stringify(database2);
    super(
      `Database conflict between ${database1} and ${database2}.`,
      options,
    );
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
export class MissingNamespace extends SurrealError {
  static {
    this.prototype.name = "MissingNamespace";
  }

  /**
   * @param options エラーオプション。
   */
  constructor(options?: SurrealErrorOptions | undefined) {
    super("The namespace must be specified before the database.", options);
  }
}

/**
 * このエラーは RPC レスポンスがエラーを示した場合に投げられます。
 * 接続したプロトコルによる通信やレスポンスボディのデコードなどに問題はありませんが、SurrealDB が RPC リクエストを処理できないことを意味します。
 */
export class RpcResponseError extends SurrealError {
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
   * @param response RPC レスポンス。
   * @param options エラーオプション。
   */
  constructor(
    response: IdLessRpcResponseErr | BidirectionalRpcResponseErr,
    options?: SurrealErrorOptions | undefined,
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
export class QueryFailure extends SurrealAggregateError {
  static {
    this.prototype.name = "QueryFailure";
  }

  /**
   * @param errors エラーメッセージ。
   */
  constructor(errors: readonly string[]) {
    super(`Query failed with ${errors.length} error(s)`, errors);
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
export class EngineDisconnected extends SurrealError {
  static {
    this.prototype.name = "EngineDisconnected";
  }

  /**
   * @param options エラーオプション。
   */
  constructor(options?: SurrealErrorOptions | undefined) {
    super("The engine is disconnected.", options);
  }
}
