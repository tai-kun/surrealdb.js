export {
  CborDecodeStreamAbortFailedError,
  CborError,
  CborMaxDepthReachedError,
  CborMemoryBlockConflictError,
  CborMemoryBlockError,
  CborMemoryBlockInUseError,
  CborMemoryError,
  CborSyntaxError,
  CborTooLittleDataError,
  CborTooMuchDataError,
  CborUndefinedMemoryBlockError,
  CborUnsafeMapKeyError,
  CborWellFormednessError,
} from "./cbor";

export {
  CircularEngineReferenceError,
  Closed,
  ConnectionConflictError,
  EngineNotFoundError,
  MissingNamespaceError,
  QueryFailedError,
  RpcResponseError,
} from "./client";

export {
  ConnectionUnavailableError,
  EngineError,
  type EngineSurrealErrorOptions,
  HttpEngineError,
  ServerResponseError,
  StateTransitionError,
  WebSocketEngineError,
  type WebSocketEngineStatusCode,
} from "./engine";

export {
  CircularReferenceError,
  NumberRangeError,
  type NumberRangeErrorOptions,
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
  SurrealTypeError,
  SurrealValueError,
  unreachable,
  UnreachableError,
  UnsupportedRuntimeError,
} from "./general";

export type * from "./get-type-name";
export { default as getTypeName } from "./get-type-name";

export { JsonError, JsonUnsafeMapKeyError } from "./json";
