import { SurrealError, type SurrealErrorOptions } from "./shared";

/**
 * このエラーは、到達不能なコードに到達した場合に投げられます。
 */
export class UnreachableError extends SurrealError {
  static {
    this.prototype.name = "UnreachableError";
  }

  /**
   * @param options エラーオプション。
   */
  constructor(options?: SurrealErrorOptions | undefined) {
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
 * @param cause 到達不能の原因。
 * @throws {UnreachableError}
 */
export function unreachable(cause: never): never;

export function unreachable(...args: [cause?: never]): never {
  throw new UnreachableError(
    args.length > 0 && { cause: args[0] } || undefined,
  );
}

/**
 * このエラーは、サポートされていないランタイムを使用していると判断された場合に投げられます。
 */
export class UnsupportedRuntime extends SurrealError {
  static {
    this.prototype.name = "UnsupportedRuntime";
  }

  /**
   * @param reason 判断の理由。
   * @param options エラーオプション。
   */
  constructor(reason: string, options?: SurrealErrorOptions | undefined) {
    super("Unsupported runtime. " + reason, options);
  }
}
