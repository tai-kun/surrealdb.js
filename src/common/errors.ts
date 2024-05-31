export class SurrealDbError extends Error {}

/**
 * This error is thrown when a resource has been disposed.
 *
 * This mainly means that the classes that manage asynchronous tasks have already done their job.
 */
export class ResourceDisposed extends SurrealDbError {
  static {
    this.prototype.name = "ResourceDisposed";
  }

  /**
   * @param name - The name of the resource.
   * @param options - The error options.
   */
  constructor(name: string, options?: ErrorOptions | undefined) {
    super(`The resource "${name}" has been disposed.`, options);
  }
}

/**
 * This error is thrown when converting data fails.
 */
export class DataConversionFailure extends SurrealDbError {
  static {
    this.prototype.name = "DataConversionFailure";
  }

  /**
   * @param from - The source data type.
   * @param to - The target data type.
   * @param source - The source data.
   * @param options - The error options.
   */
  constructor(
    from: string,
    to: string,
    public source: unknown,
    options?: ErrorOptions | undefined,
  ) {
    super(
      `Failed to convert the data from ${from} to ${to}.`,
      options,
    );
  }
}

/**
 * This error is thrown when a task fails.
 */
export class AggregateTasksError extends SurrealDbError {
  static {
    this.prototype.name = "AggregateTasksError";
  }

  /**
   * @param errors - The errors for the failed tasks.
   */
  constructor(errors: readonly unknown[]) {
    super(`${errors.length} task(s) failed.`, { cause: errors });
  }
}

/**
 * This error is thrown when a state transition fails.
 *
 * This mainly means that when switching between connection states,
 * the callback function listening for changes in that state threw an error.
 */
export class StateTransitionError extends SurrealDbError {
  static {
    this.prototype.name = "StateTransitionError";
  }

  /**
   * @param from - The source state.
   * @param to - The target state.
   * @param options - The error options.
   */
  constructor(
    from: { readonly toString: () => string },
    to: { readonly toString: () => string },
    options?: ErrorOptions | undefined,
  ) {
    super(`Failed to transition from "${from}" to "${to}".`, options);
  }
}

/**
 * This error is thrown when a connection is unavailable.
 *
 * This mainly means that the connection to the endpoint has not yet started.
 * If a connection is in progress, it generally waits for completion.
 * For instance, it's possible that something like `.connect()` has not been called beforehand.
 *
 * Alternatively, due to timing issues related to asynchronous processing, errors may very rarely occur.
 */
export class ConnectionUnavailable extends SurrealDbError {
  static {
    this.prototype.name = "ConnectionUnavailable";
  }

  /**
   * @param options - The error options.
   */
  constructor(options?: ErrorOptions | undefined) {
    super("The connection is unavailable.", options);
  }
}

/**
 * This error indicates that the connection was forcibly terminated.
 *
 * It is an error obtained via an AbortSignal,
 * and any process recognizing this must immediately halt its current operation.
 */
export class EngineDisconnected extends SurrealDbError {
  static {
    this.prototype.name = "EngineDisconnected";
  }

  /**
   * @param options - The error options.
   */
  constructor(options?: ErrorOptions | undefined) {
    super("The engine is disconnected.", options);
  }
}

/**
 * This error is thrown when the engine is already connected.
 */
export class EngineAlreadyConnected extends SurrealDbError {
  static {
    this.prototype.name = "EngineAlreadyConnected";
  }

  /**
   * @param options - The error options.
   */
  constructor(options?: ErrorOptions | undefined) {
    super("The engine is already connected.", options);
  }
}

/**
 * This error is thrown when a namespace is not specified before the database.
 */
export class MissingNamespace extends SurrealDbError {
  static {
    this.prototype.name = "MissingNamespace";
  }

  /**
   * @param options - The error options.
   */
  constructor(options?: ErrorOptions | undefined) {
    super("The namespace must be specified before the database.", options);
  }
}

/**
 * This error is thrown when a response is invalid.
 */
export class ResponseError extends SurrealDbError {
  static {
    this.prototype.name = "ResponseError";
  }

  /**
   * @param message - The error message.
   * @param options - The error options.
   */
  constructor(message: string, options?: ErrorOptions | undefined);

  /**
   * @param error - The error object.
   * @param options - The error options.
   */
  constructor(
    error: { readonly code: number; readonly message: string },
    options?: ErrorOptions | undefined,
  );

  constructor(
    arg0:
      | string
      | { readonly code: number; message: string },
    options?: ErrorOptions | undefined,
  ) {
    if (typeof arg0 === "string") {
      super(arg0, options);
    } else {
      super(`[${arg0.code}] ${arg0.message}`, options);
    }
  }
}

/**
 * This error is thrown when a single client attempts to connect to multiple endpoints simultaneously.
 */
export class ConnectionConflict extends SurrealDbError {
  static {
    this.prototype.name = "ConnectionConflict";
  }

  /**
   * @param endpoint1 - The endpoint.
   * @param endpoint2 - The another endpoint.
   * @param options - The error options.
   */
  constructor(
    endpoint1: string | URL,
    endpoint2: string | URL,
    options?: ErrorOptions | undefined,
  ) {
    super(
      `Connection conflict between ${endpoint1} and ${endpoint2}.`,
      options,
    );
  }
}

/**
 * This error is thrown when a circular reference occurs between protocols.
 */
export class CircularEngineReference extends SurrealDbError {
  static {
    this.prototype.name = "CircularEngineReference";
  }

  /**
   * @param seen - The seen protocols.
   * @param options - The error options.
   */
  constructor(seen: Iterable<string>, options?: ErrorOptions | undefined) {
    super(`Circular engine reference: ${[...seen]}`, options);
  }
}

/**
 * This error is thrown when attempting to connect using an unsupported protocol.
 */
export class UnsupportedProtocol extends SurrealDbError {
  static {
    this.prototype.name = "UnsupportedProtocol";
  }

  /**
   * @param protocol - The protocol.
   * @param options - The error options.
   */
  constructor(protocol: string, options?: ErrorOptions | undefined) {
    super(`Unsupported protocol: ${protocol}`, options);
  }
}

/**
 * This error is thrown when an unknown CBOR tag is encountered.
 */
export class UnknownCborTag extends SurrealDbError {
  static {
    this.prototype.name = "UnknownCborTag";
  }

  /**
   * @param tag - The unknown tag.
   * @param options - The error options.
   */
  constructor(tag: number | bigint, options?: ErrorOptions | undefined) {
    super(`Unknown CBOR tag: ${tag}`, options);
  }
}

/**
 * This error is thrown when the validation of values, such as input values, fails.
 */
export class ValidationError extends SurrealDbError {
  static {
    this.prototype.name = "ValidationError";
  }

  /**
   * @param message - The error message.
   * @param options - The error options.
   */
  constructor(message: string, options?: ErrorOptions | undefined) {
    super(message, options);
  }
}
