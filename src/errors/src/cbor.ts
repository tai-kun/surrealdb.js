import { SurrealError, type SurrealErrorOptions } from "./general";

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
    super("Unconsumed input bytes remain after decoding.", options);
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
    super(
      "Input data appears truncated or incomplete for CBOR decoding.",
      options,
    );
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
    this.prototype.name = "CborUnsafeMapKeyError";
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

export class CborDecodeStreamAbortFailedError extends CborError {
  static {
    this.prototype.name = "CborStreamAbortFailedError";
  }

  override cause: unknown[];

  constructor(
    errors: readonly unknown[],
    options?: Omit<SurrealErrorOptions, "cause"> | undefined,
  ) {
    super("Failed to abort decode-stream", options);
    this.cause = errors.slice();
  }
}

export class CborMemoryError extends CborError {
  static {
    this.prototype.name = "CborMemoryError";
  }
}

export class CborMemoryBlockError extends CborError {
  static {
    this.prototype.name = "CborMemoryBlockError";
  }
}

type MemoryAddress = string | number;

export class CborMemoryBlockConflictError extends CborMemoryBlockError {
  static {
    this.prototype.name = "CborMemoryBlockConflictError";
  }

  constructor(
    address: MemoryAddress,
    expectedSize: number,
    actualSize: number,
  ) {
    super(
      `Memory conflict at address ${address}: `
        + `Expected size ${expectedSize}, but found ${actualSize}.`,
    );
  }
}

export class CborMemoryBlockInUseError extends CborMemoryBlockError {
  static {
    this.prototype.name = "CborMemoryBlockInUseError";
  }
}

export class CborUndefinedMemoryBlockError extends CborMemoryBlockError {
  static {
    this.prototype.name = "CborUndefinedMemoryBlockError";
  }

  constructor(address: MemoryAddress) {
    super(`Memory block at address ${address} is not defined.`);
  }
}
