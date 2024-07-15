/**
 * {@link SurrealError} のオプション。
 */
export type SurrealErrorOptions = "cause" extends keyof Error ? ErrorOptions
  : { cause?: unknown };

/**
 * このパッケージがハンドリングするエラーが継承するエラークラス。
 */
export class SurrealError extends Error {
  /**
   * @param message エラーメッセージ。
   * @param options エラーオプション。
   */
  constructor(message: string, options?: SurrealErrorOptions | undefined) {
    super(message, options);

    if (!("cause" in this) && options && "cause" in options) {
      this.cause = options.cause;
    }
  }
}

/**
 * このエラーは、値が期待された型と異なる場合に投げられます。
 * バリデーターや埋め込まれた検証がこのエラーを投げるため、あらゆる場所でこのエラーを捕捉する可能性があります。
 */
export class SurrealTypeError extends SurrealError {
  static {
    this.prototype.name = "SurrealTypeError";
  }
}

export class SurrealRangeError extends SurrealError {
  static {
    this.prototype.name = "SurrealRangeError";
  }
}

/**
 * 複数のエラーがまとめられたエラー。
 */
export class SurrealAggregateError extends SurrealError {
  static {
    this.prototype.name = "SurrealAggregateError";
  }

  override cause: unknown[];

  /**
   * @param message エラーメッセージ。
   * @param errors エラー。
   * @param options エラーオプション。
   */
  constructor(
    message: string,
    errors: readonly unknown[],
    options?: Omit<SurrealErrorOptions, "cause"> | undefined,
  ) {
    super(message, options);
    this.cause = errors.slice();
  }
}
