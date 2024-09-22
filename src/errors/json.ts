import { SurrealError, type SurrealErrorOptions } from "./general";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#json)
 */
export class JsonError extends SurrealError {
  static {
    this.prototype.name = "JsonError";
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#jsonunsafemapkeyerror)
 */
export class JsonUnsafeMapKeyError extends JsonError {
  static {
    this.prototype.name = "JsonUnsafeMapKeyError";
  }

  constructor(
    public key: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(
      `Invalid key for JSON: ${String(key)}. The key must be a valid JSON`
        + " data type that is safe to use in a JavaScript map or object.",
      options,
    );
  }
}
