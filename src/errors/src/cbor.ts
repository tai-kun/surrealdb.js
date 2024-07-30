import { SurrealError, type SurrealErrorOptions } from "./general";

export class CborError extends SurrealError {
  static {
    this.prototype.name = "CborError";
  }
}

// https://www.rfc-editor.org/rfc/rfc8949.html#name-well-formedness-errors-and-
export class CborWellFormednessError extends CborError {
  static {
    this.prototype.name = "CborWellFormednessError";
  }
}

// https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-2.2
export class CborTooMuchDataError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborTooMuchDataError";
  }

  constructor(options?: SurrealErrorOptions | undefined) {
    super("There are input bytes left that were not consumed.", options);
  }
}

// https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-2.4
export class CborTooLittleDataError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborTooLittleDataError";
  }

  constructor(options?: SurrealErrorOptions | undefined) {
    super("There are input bytes left that were not consumed.", options);
  }
}

// https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-2.6
export class CborSyntaxError extends CborWellFormednessError {
  static {
    this.prototype.name = "CborSyntaxError";
  }
}

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
