// dprint-ignore
type ErrorOptionsBase =
  "cause" extends keyof Error
    ? Readonly<ErrorOptions>
    : { readonly cause?: unknown } // polyfill

export interface SurrealErrorOptions extends ErrorOptionsBase {}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/errors/general/#surrealerror)
 */
export class SurrealError extends Error {
  override name = "SurrealError";

  constructor(message: string, options?: SurrealErrorOptions | undefined) {
    super(message, options);

    if (!("cause" in this) && options && "cause" in options) {
      this.cause = options.cause; // polyfill
    }
  }
}

export class SurrealTypeError extends SurrealError {
  override name = "SurrealTypeError";

  constructor(
    expected: string,
    actual: string,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`Expected type ${expected} but got ${actual}.`, options);
  }
}

export class CircularReferenceError extends SurrealError {
  override name = "CircularReferenceError";
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/errors/general/#numberrangeerror)
 */
export interface NumberRangeErrorOptions extends SurrealErrorOptions {
  readonly integer?: boolean | undefined;
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/errors/general/#numberrangeerror)
 */
export class NumberRangeError extends SurrealError {
  override name = "NumberRangeError";

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
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/errors/general/#unsupportedruntimeerror)
 */
export class UnsupportedRuntimeError extends SurrealError {
  override name = "UnsupportedRuntimeError";

  constructor(reason: string, options?: SurrealErrorOptions | undefined) {
    super("Unsupported runtime. " + reason, options);
  }
}

export class UnreachableError extends SurrealError {
  override name = "UnreachableError";

  constructor(options?: SurrealErrorOptions | undefined) {
    super("Unreachable code reached.", options);
  }
}

export function unreachable(): never;

export function unreachable(cause: never): never;

export function unreachable(...a: [cause?: never]): never {
  throw new UnreachableError(a.length > 0 && { cause: a[0] } || undefined);
}
