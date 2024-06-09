export class SurrealDbError extends Error {}

/**
 * このエラーは、プロトコル間で循環参照が発生した場合に投げられる。
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
 * このエラーは、サポートされていないプロトコルを使用しようとした場合に投げられる。
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
