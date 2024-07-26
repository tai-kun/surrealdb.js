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

export interface NumberRangeErrorOptions extends SurrealErrorOptions {
  readonly integer?: boolean | undefined;
}

export class NumberRangeError extends SurrealError {
  override name = "NumberRangeError";

  public integer: boolean;

  constructor(
    public range: [from: number, to: number],
    public actual: number,
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
