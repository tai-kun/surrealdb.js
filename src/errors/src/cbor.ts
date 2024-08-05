import {
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
} from "./general";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#cborerror)
 */
export class CborError extends SurrealError {
  static {
    this.prototype.name = "CborError";
  }
}

// https://datatracker.ietf.org/doc/html/rfc8949#name-well-formedness-errors-and-
/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#cborwellformednesserror)
 */
export class CborWellFormednessError extends CborError {
  static {
    this.prototype.name = "CborWellFormednessError";
  }
}

// https://datatracker.ietf.org/doc/html/rfc8949#section-appendix.f-2.2
/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#cbortoomuchdataerror)
 */
export class CborTooMuchDataError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborTooMuchDataError";
  }

  constructor(options?: SurrealErrorOptions | undefined) {
    super("There are input bytes left that were not consumed.", options);
  }
}

// https://datatracker.ietf.org/doc/html/rfc8949#section-appendix.f-2.4
/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#cbortoolittledataerror)
 */
export class CborTooLittleDataError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborTooLittleDataError";
  }

  constructor(options?: SurrealErrorOptions | undefined) {
    super("There are input bytes left that were not consumed.", options);
  }
}

// https://datatracker.ietf.org/doc/html/rfc8949#section-appendix.f-2.6
/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#cborsyntaxerror)
 */
export class CborSyntaxError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborSyntaxError";
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#cbormaxdepthreachederror)
 */
export class CborMaxDepthReachedError extends CborError {
  static {
    this.prototype.name = "CborMaxDepthReachedError";
  }

  constructor(
    public maxDepth: number,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`Maximum depth of ${maxDepth} has been reached.`, options);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#cborunsafemapkeyerror)
 */
export class CborUnsafeMapKeyError extends CborError {
  static {
    this.prototype.name = "CborUnsafeMapKey";
  }

  constructor(
    public key: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(
      `Invalid key for CBOR map: ${String(key)}. The key must be a valid CBOR`
        + " data type that is safe to use in a JavaScript map or object.",
      options,
    );
  }
}

export class CborDecodeStreamAbortFailedError extends SurrealAggregateError {
  static {
    this.prototype.name = "CborStreamAbortFailedError";
  }

  constructor(
    errors: readonly unknown[],
    options?: Omit<SurrealErrorOptions, "cause"> | undefined,
  ) {
    super("Failed to abort decode-stream", errors, options);
  }
}
