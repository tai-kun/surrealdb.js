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
} from "./src/cbor";

export {
  CircularEngineReferenceError,
  ConnectionConflictError,
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
  type WebSocketEngineStatusCode,
} from "./src/engine";

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
} from "./src/general";

export type * from "./src/get-type-name";
export { default as getTypeName } from "./src/get-type-name";
