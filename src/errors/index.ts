export {
  CircularEngineReference,
  ConnectionConflict,
  DatabaseConflict,
  EngineDisconnected,
  MissingNamespace,
  NamespaceConflict,
  QueryFailure,
  RpcResponseError,
  UnsupportedProtocol,
} from "./src/client";
export {
  ConnectionUnavailable,
  EngineError,
  type EngineSurrealErrorOptions,
  HttpEngineError,
  InvalidResponse,
  StateTransitionError,
  WebSocketEngineError,
  type WebSocketEngineErrorCode,
} from "./src/engine";
export {
  CborSyntaxError,
  CborTooLittleDataError,
  CborWellFormednessError,
  DataFormatError,
} from "./src/formatter";
export {
  cast,
  CastingError,
  unreachable,
  UnreachableError,
  UnsupportedRuntime,
} from "./src/general";
export {
  SurrealAggregateError,
  SurrealError,
  type SurrealErrorOptions,
  SurrealRangeError,
  SurrealTypeError,
} from "./src/shared";
export { AggregateTasksError, ResourceAlreadyDisposed } from "./src/utils";
