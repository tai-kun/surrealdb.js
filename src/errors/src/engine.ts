import {
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
} from "./general";

export interface EngineSurrealErrorOptions extends SurrealErrorOptions {
  readonly fatal?: boolean | undefined;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#engineerror)
 */
export class EngineError extends SurrealError {
  static {
    this.prototype.name = "EngineError";
  }

  fatal: boolean | undefined;

  constructor(
    message: string,
    options?: EngineSurrealErrorOptions | undefined,
  ) {
    super(message, options);
    this.fatal = options?.fatal;
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#httpengineerror)
 */
export class HttpEngineError extends EngineError {
  static {
    this.prototype.name = "HttpEngineError";
  }

  constructor(
    message: string,
    options?: EngineSurrealErrorOptions | undefined,
  ) {
    super(message, options);
  }
}

// See: https://developer.mozilla.org/docs/Web/API/CloseEvent/code
// See: https://www.iana.org/assignments/websocket/websocket.xml#close-code-number
export namespace WebSocketEngineStatusCode {
  export type Defined =
    // | 1000
    // | 1004
    // | 1005
    // | 1015
    // | 1001
    // | 1006
    | 1002
    | 1003
    | 1007
    | 1008
    | 1009
    | 1010
    | 1011
    | 1012
    | 1013
    | 1014;

  export type Custom =
    | 3150
    | 3151
    | 3152
    | 3153
    | 3154;
}

/**
 * {@link WebSocketEngineError}
 */
export type WebSocketEngineStatusCode =
  | WebSocketEngineStatusCode.Defined
  | WebSocketEngineStatusCode.Custom;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#websocketengineerror)
 */
export class WebSocketEngineError extends EngineError {
  static {
    this.prototype.name = "WebSocketEngineError";
  }

  constructor(
    public code: WebSocketEngineStatusCode,
    message: string,
    options?: EngineSurrealErrorOptions | undefined,
  ) {
    super(message, options);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#statetransitionerror)
 */
export class StateTransitionError extends SurrealAggregateError {
  static {
    this.prototype.name = "StateTransitionError";
  }

  constructor(
    public from: string,
    public to: string,
    public fallback: string,
    errors: readonly unknown[],
    options?: Omit<SurrealErrorOptions, "cause"> | undefined,
  ) {
    super(
      `The transition from \`${from}\` to \`${to}\` failed, `
        + `falling back to \`${fallback}\`.`,
      errors,
      options,
    );
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/errors/#connectionunavailableerror)
 */
export class ConnectionUnavailableError extends SurrealError {
  static {
    this.prototype.name = "ConnectionUnavailableError";
  }

  constructor(options?: SurrealErrorOptions | undefined) {
    super("The connection is unavailable.", options);
  }
}

export class ResponseError extends SurrealError {
  static {
    this.prototype.name = "ResponseError";
  }
}
