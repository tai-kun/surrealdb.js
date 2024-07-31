import type {
  BidirectionalRpcResponseErr,
  IdLessRpcResponseErr,
} from "@tai-kun/surrealdb/types";
import { ResponseError } from "./engine";
import {
  CircularReferenceError,
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
} from "./general";

export class CircularEngineReferenceError extends CircularReferenceError {
  static {
    this.prototype.name = "CircularEngineReferenceError";
  }

  constructor(
    seen: Iterable<string>,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`Circular engine reference: ${[...seen]}`, options);
  }
}

export class EngineNotFoundError extends SurrealError {
  static {
    this.prototype.name = "EngineNotFoundError";
  }

  constructor(protocol: string, options?: SurrealErrorOptions | undefined) {
    super(`No ${protocol} protocol engine found.`, options);
  }
}

export class ConnectionConflictError extends SurrealError {
  static {
    this.prototype.name = "ConnectionConflictError";
  }

  constructor(
    endpoint1: unknown,
    endpoint2: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    endpoint1 = JSON.stringify(endpoint1);
    endpoint2 = JSON.stringify(endpoint2);
    super(
      `Connection conflict between ${endpoint1} and ${endpoint2}.`,
      options,
    );
  }
}

export class NamespaceConflictError extends SurrealError {
  static {
    this.prototype.name = "NamespaceConflictError";
  }

  constructor(
    namespace1: unknown,
    namespace2: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    namespace1 = JSON.stringify(namespace1);
    namespace2 = JSON.stringify(namespace2);
    super(
      `Namespace conflict between ${namespace1} and ${namespace2}.`,
      options,
    );
  }
}

export class DatabaseConflictError extends SurrealError {
  static {
    this.prototype.name = "DatabaseConflictError";
  }

  constructor(
    database1: unknown,
    database2: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    database1 = JSON.stringify(database1);
    database2 = JSON.stringify(database2);
    super(
      `Database conflict between ${database1} and ${database2}.`,
      options,
    );
  }
}

export class MissingNamespaceError extends SurrealError {
  static {
    this.prototype.name = "MissingNamespaceError";
  }

  constructor(
    public database: string,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(
      `The namespace must be specified before the database: ${database}`,
      options,
    );
  }
}

export class RpcResponseError extends ResponseError {
  static {
    this.prototype.name = "RpcResponseError";
  }

  id?: BidirectionalRpcResponseErr["id"];

  code: BidirectionalRpcResponseErr["error"]["code"];

  constructor(
    response: IdLessRpcResponseErr | BidirectionalRpcResponseErr,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(response.error.message, options);
    this.code = response.error.code;

    if ("id" in response) {
      this.id = response.id;
    }
  }
}

export class QueryFailedError extends SurrealAggregateError {
  static {
    this.prototype.name = "QueryFailedError";
  }

  constructor(errors: readonly string[]) {
    super(`Query failed with ${errors.length} error(s).`, errors);
  }
}

export class Disconnected extends SurrealError {
  static {
    this.prototype.name = "Disconnected";
  }
}
