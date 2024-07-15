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
export { CborError, DataFormatError, UnknownCborTag } from "./src/formatter";
export {
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
