export class SurrealDbError extends Error {}

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
