import { SurrealError, type SurrealErrorOptions } from "./general";

export interface EngineSurrealErrorOptions extends SurrealErrorOptions {
  readonly fatal?: boolean | undefined;
}

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
    | 3153;
}

export type WebSocketEngineStatusCode =
  | WebSocketEngineStatusCode.Defined
  | WebSocketEngineStatusCode.Custom;

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

export class StateTransitionError extends SurrealError {
  static {
    this.prototype.name = "StateTransitionError";
  }

  constructor(
    public from: number,
    public to: number,
    public fallback: number,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(
      `The transition from \`${from}\` to \`${to}\` failed, `
        + `falling back to \`${fallback}\`.`,
      options,
    );
  }
}

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
