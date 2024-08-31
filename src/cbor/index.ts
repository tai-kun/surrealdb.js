export type * from "./src/decode-stream";
export { default as decodeStream } from "./src/decode-stream";

export type * from "./src/decode";
export { default as decode } from "./src/decode";

export {
  CONTINUE,
  type IsSafeMapKey,
  type IsSafeObjectKey,
  type Reviver,
  type ReviverObject,
  type SimpleItemReviver,
  type TaggedItemReviver,
} from "./src/decoder";

export type * from "./src/encode";
export { default as encode } from "./src/encode";

export {
  type AdditionalInfo,
  AI_EIGHT_BYTES,
  AI_FOUR_BYTES,
  AI_INDEFINITE_NUM_BYTES,
  AI_ONE_BYTE,
  AI_SIMPLE_FALSE,
  AI_SIMPLE_NULL,
  AI_SIMPLE_TRUE,
  AI_SIMPLE_UNDEFINED,
  AI_TWO_BYTES,
  type DataItem,
  type DataItemValue,
  HEADER_FALSE,
  HEADER_FLOAT_DOUBLE,
  HEADER_FLOAT_HALF,
  HEADER_NULL,
  HEADER_TRUE,
  HEADER_UNDEFINED,
  type MajorType,
  MT_ARRAY,
  MT_BYTE_STRING,
  MT_MAP,
  MT_NEGATIVE_INTEGER,
  MT_SIMPLE_FLOAT,
  MT_TAG,
  MT_UNSIGNED_INTEGER,
  MT_UTF8_STRING,
  Simple,
} from "./src/spec";

export type * from "./src/tagged";
export { default as Tagged } from "./src/tagged";

export type { ToCBOR } from "./src/traits";
export { hasToCBOR } from "./src/traits";

export {
  type Replacer,
  write,
  writeBigInt,
  writeBoolean,
  writeByteString,
  writeEncodedUtf8String,
  writeHeader,
  writeNullable,
  writeNumber,
  writePayload,
  writeUtf8String,
} from "./src/write-utils";

export type * from "./src/writer";
