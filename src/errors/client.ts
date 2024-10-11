import type {
  BidirectionalRpcResponseErr,
  IdLessRpcResponseErr,
} from "@tai-kun/surrealdb/types";
import { ServerResponseError } from "./engine";
import {
  CircularReferenceError,
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
} from "./general";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#circularenginereferenceerror)
 */
export class CircularEngineReferenceError extends CircularReferenceError {
  static {
    this.prototype.name = "CircularEngineReferenceError";
  }

  // @ts-expect-error
  reference: string;
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#enginenotfounderror)
 */
export class EngineNotFoundError extends SurrealError {
  static {
    this.prototype.name = "EngineNotFoundError";
  }

  constructor(
    public scheme: string,
    options?: SurrealErrorOptions | undefined,
  ) {
    super(`No ${scheme} scheme engine found.`, options);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#connectionconflicterror)
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
      `An attempt was made to connect to ${endpoint2}`
        + ` while ${endpoint1} was already connected.`,
      options,
    );
    this.endpoint1 = endpoint1 as string;
    this.endpoint2 = endpoint2 as string;
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#missingnamespaceerror)
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#rpcresponseerror)
 */
export class RpcResponseError extends ServerResponseError {
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#queryfailederror)
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/guides/errors/#closeed)
 */
export class Closed extends SurrealError {
  static {
    this.prototype.name = "Closed";
  }
}
