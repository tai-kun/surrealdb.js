export {
  CborError,
  CborMaxDepthReachedError,
  CborSyntaxError,
  CborTooLittleDataError,
  CborTooMuchDataError,
  CborUnsafeMapKeyError,
  CborWellFormednessError,
} from "./src/cbor";

export {
  // ConnectionConflictError,
  CircularEngineReferenceError,
  DatabaseConflictError,
  Disconnected,
  EngineNotFoundError,
  MissingNamespaceError,
  NamespaceConflictError,
  QueryFailedError,
  RpcResponseError,
} from "./src/client";

export {
  ConnectionUnavailableError,
  EngineError,
  type EngineSurrealErrorOptions,
  HttpEngineError,
  ResponseError,
  StateTransitionError,
  WebSocketEngineError,
  type WebSocketEngineErrorCode,
} from "./src/engine";

export {
  CircularReferenceError,
  NumberRangeError,
  type NumberRangeErrorOptions,
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
  SurrealTypeError,
  unreachable,
  UnreachableError,
  UnsupportedRuntimeError,
} from "./src/general";
