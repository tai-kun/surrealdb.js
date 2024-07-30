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
  CircularReferenceError,
  NumberRangeError,
  type NumberRangeErrorOptions,
  SurrealError,
  type SurrealErrorOptions,
  SurrealTypeError,
  unreachable,
  UnreachableError,
  UnsupportedRuntimeError,
} from "./src/general";
