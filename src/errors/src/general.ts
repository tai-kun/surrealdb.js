// dprint-ignore
type ErrorOptionsBase =
  "cause" extends keyof Error
    ? Readonly<ErrorOptions>
    : { readonly cause?: unknown } // polyfill

export interface SurrealErrorOptions extends ErrorOptionsBase {}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#surrealerror)
 */
export class SurrealError extends Error {
  static {
    this.prototype.name = "SurrealError";
  }

  constructor(message: string, options?: SurrealErrorOptions | undefined) {
    super(message, options);

    if (!("cause" in this) && options && "cause" in options) {
      this.cause = options.cause; // polyfill
    }
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#surrealtypeerror)
 */
export class SurrealTypeError extends SurrealError {
  static {
    this.prototype.name = "SurrealTypeError";
  }

  constructor(
    public expected: string,
    public actual: string,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`Expected ${expected} but got ${actual}.`, options);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#surrealaggregateerror)
 */
export class SurrealAggregateError extends SurrealError {
  static {
    this.prototype.name = "SurrealAggregateError";
  }

  override cause: unknown[];

  constructor(
    message: string,
    errors: readonly unknown[],
    options?: Omit<SurrealErrorOptions, "cause"> | undefined,
  ) {
    super(message, options);
    this.cause = errors.slice();
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#circularreferenceerror)
 */
export class CircularReferenceError extends SurrealError {
  static {
    this.prototype.name = "CircularReferenceError";
  }
}

/**
 * {@link NumberRangeError}
 */
export interface NumberRangeErrorOptions extends SurrealErrorOptions {
  readonly integer?: boolean | undefined;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#numberrangeerror)
 */
export class NumberRangeError extends SurrealError {
  static {
    this.prototype.name = "NumberRangeError";
  }

  public integer: boolean;

  constructor(
    public range: [from: number | bigint, to: number | bigint],
    public actual: number | bigint,
    options: NumberRangeErrorOptions | undefined = {},
  ) {
    super(
      `Value ${actual} is out of range. Expected value to be between `
        + `${range[0]} and ${range[1]}`
        + (options.integer ? " as an integer." : "."),
      options,
    );
    this.integer = !!options.integer;
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#unsupportedruntimeerror)
 */
export class UnsupportedRuntimeError extends SurrealError {
  static {
    this.prototype.name = "UnsupportedRuntimeError";
  }

  constructor(reason: string, options?: SurrealErrorOptions | undefined) {
    super("Unsupported runtime. " + reason, options);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#unreachableerror)
 */
export class UnreachableError extends SurrealError {
  static {
    this.prototype.name = "UnreachableError";
  }

  constructor(options?: SurrealErrorOptions | undefined) {
    super("Unreachable code reached.", options);
  }
}

export function unreachable(): never;

export function unreachable(cause: never): never;

export function unreachable(...a: [cause?: never]): never {
  throw new UnreachableError(a.length > 0 && { cause: a[0] } || undefined);
}
