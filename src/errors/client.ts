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

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#circularenginereferenceerror)
 */
export class CircularEngineReferenceError extends CircularReferenceError {
  static {
    this.prototype.name = "CircularEngineReferenceError";
  }

  seen: string[];

  constructor(
    seen: Iterable<string>,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`Circular engine reference: ${seen = [...seen]}`, options);
    this.seen = seen as string[];
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#enginenotfounderror)
 */
export class EngineNotFoundError extends SurrealError {
  static {
    this.prototype.name = "EngineNotFoundError";
  }

  constructor(
    public protocol: string,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`No ${protocol} protocol engine found.`, options);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#connectionconflicterror)
 */
export class ConnectionConflictError extends SurrealError {
  static {
    this.prototype.name = "ConnectionConflictError";
  }

  endpoint1: string;
  endpoint2: string;

  constructor(
    endpoint1: unknown,
    endpoint2: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    endpoint1 = String(endpoint1);
    endpoint2 = String(endpoint2);
    super(
      `Connection conflict between ${endpoint1} and ${endpoint2}.`,
      options,
    );
    this.endpoint1 = endpoint1 as string;
    this.endpoint2 = endpoint2 as string;
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#namespaceconflicterror)
 */
export class NamespaceConflictError extends SurrealError {
  static {
    this.prototype.name = "NamespaceConflictError";
  }

  namespace1: string;
  namespace2: string;

  constructor(
    namespace1: unknown,
    namespace2: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    namespace1 = String(namespace1);
    namespace2 = String(namespace2);
    super(
      `Namespace conflict between ${namespace1} and ${namespace2}.`,
      options,
    );
    this.namespace1 = namespace1 as string;
    this.namespace2 = namespace2 as string;
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#databaseconflicterror)
 */
export class DatabaseConflictError extends SurrealError {
  static {
    this.prototype.name = "DatabaseConflictError";
  }

  database1: string;
  database2: string;

  constructor(
    database1: unknown,
    database2: unknown,
    options?: SurrealErrorOptions | undefined,
  ) {
    database1 = String(database1);
    database2 = String(database2);
    super(
      `Database conflict between ${database1} and ${database2}.`,
      options,
    );
    this.database1 = database1 as string;
    this.database2 = database2 as string;
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#missingnamespaceerror)
 */
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

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#rpcresponseerror)
 */
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

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#queryfailederror)
 */
export class QueryFailedError extends SurrealAggregateError {
  static {
    this.prototype.name = "QueryFailedError";
  }

  // @ts-expect-error
  override cause: string[];

  constructor(errors: readonly string[]) {
    super(`Query failed with ${errors.length} error(s).`, errors);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/errors/#closeed)
 */
export class Closed extends SurrealError {
  static {
    this.prototype.name = "Closed";
  }
}
