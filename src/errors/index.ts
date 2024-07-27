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
  NumberRangeError,
  type NumberRangeErrorOptions,
  SurrealError,
  type SurrealErrorOptions,
  SurrealTypeError,
  unreachable,
  UnreachableError,
  UnsupportedRuntimeError,
} from "./src/general";
