export type SurrealErrorOptions = "cause" extends keyof Error ? ErrorOptions
  : { cause?: unknown };

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/errors/general/#surrealerror)
 */
export class SurrealError extends Error {
  override name = "SurrealError";

  constructor(message: string, options?: SurrealErrorOptions | undefined) {
    super(message, options);

    if (!("cause" in this) && options && "cause" in options) {
      this.cause = options.cause;
    }
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
