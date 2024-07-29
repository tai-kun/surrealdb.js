import {
  CborMaxDepthReachedError,
  CborUnsafeMapKeyError,
  NumberRangeError,
  SurrealTypeError,
  unreachable,
} from "@tai-kun/surreal/errors";
import isPlainObject from "is-plain-obj";
import {
  AI_EIGHT_BYTES,
  AI_FOUR_BYTES,
  AI_ONE_BYTE,
  AI_TWO_BYTES,
  type DataItem,
  HEADER_FALSE,
  HEADER_FLOAT_DOUBLE,
  HEADER_FLOAT_HALF,
  // HEADER_FLOAT_SINGLE,
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
} from "./spec";
import utf8 from "./utf8";
import type { ToCBOR, Writer } from "./writer";

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writeheader)
 */
export function writeHeader(
  w: Writer,
  mt: MajorType,
  length: number | bigint,
): void {
  switch (true) {
    case length < 24:
      w.writeUint8((mt << 5) | Number(length));
      break;

    case length <= 0xff:
      w.writeUint8((mt << 5) | AI_ONE_BYTE);
      w.writeUint8(Number(length));
      break;

    case length <= 0xffff:
      w.writeUint8((mt << 5) | AI_TWO_BYTES);
      w.writeUint16(Number(length));
      break;

    case length <= 0xffffffff:
      w.writeUint8((mt << 5) | AI_FOUR_BYTES);
      w.writeUint32(Number(length));
      break;

    default:
      w.writeUint8((mt << 5) | AI_EIGHT_BYTES);
      w.writeBigUint64(BigInt(length));
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writepayload)
 */
export function writePayload(w: Writer, value: Uint8Array): void {
  w.writeBytes(value);
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writeinteger)
 */
export function writeInteger(w: Writer, value: number | bigint): void {
  if (
    value !== value // NaN
    || value === Infinity
    || value === -Infinity
  ) {
    writeFloat16(w, value as number);
  } else if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new NumberRangeError([-(2 ** 53 - 1), 2 ** 53 - 1], value);
    }

    // 整数とヘッダーの書き込み処理は同じなので、それぞれの意味は異なるけど再利用する。
    if (value >= 0) {
      writeHeader(w, MT_UNSIGNED_INTEGER, value === 0 ? 0 : value);
    } else {
      writeHeader(w, MT_NEGATIVE_INTEGER, -value - 1);
    }
  } else {
    // TODO(tai-kun): Bignums を実装する必要ありか？
    // https://www.rfc-editor.org/rfc/rfc8949.html#name-bignums

    if (value >= 0n) {
      writeHeader(w, MT_UNSIGNED_INTEGER, value);
    } else {
      writeHeader(w, MT_NEGATIVE_INTEGER, -value - 1n);
    }
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writebytestring)
 */
export function writeByteString(w: Writer, value: Uint8Array): void {
  writeHeader(w, MT_BYTE_STRING, value.length);
  writePayload(w, value);
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writeutf8string)
 */
export function writeUtf8String(w: Writer, value: string): void {
  const bytes = utf8.encode(value);
  writeHeader(w, MT_UTF8_STRING, bytes.length);
  writePayload(w, bytes);
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writeencodedutf8string)
 */
export function writeEncodedUtf8String(w: Writer, value: Uint8Array): void {
  writeHeader(w, MT_UTF8_STRING, value.length);
  writePayload(w, value);
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writetag)
 */
export function writeTag(w: Writer, value: DataItem.Tag["value"]): void {
  writeHeader(w, MT_TAG, value);
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writenullable)
 */
export function writeNullable(w: Writer, value: null | undefined): void {
  w.writeUint8(value === null ? HEADER_NULL : HEADER_UNDEFINED);
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writeboolean)
 */
export function writeBoolean(w: Writer, value: boolean): void {
  w.writeUint8(value ? HEADER_TRUE : HEADER_FALSE);
}

function writeFloat16(w: Writer, value: number): void {
  w.writeUint8(HEADER_FLOAT_HALF);
  w.writeFloat16(value); // payload
}

// function writeFloat32(w: Writer, value: number): void {
//   w.writeUint8(HEADER_FLOAT_SINGLE);
//   w.writeFloat32(value); // payload
// }

function writeFloat64(w: Writer, value: number): void {
  w.writeUint8(HEADER_FLOAT_DOUBLE);
  w.writeFloat64(value); // payload
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writefloat)
 */
export function writeFloat(w: Writer, value: number): void {
  if (
    value !== value // NaN
    || value === 0
    || value === Infinity
    || value === -Infinity
  ) {
    writeFloat16(w, value);
  } else {
    writeFloat64(w, value);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#writenumber)
 */
export function writeNumber(w: Writer, value: number | bigint): void {
  if (typeof value === "bigint" || Number.isInteger(value)) {
    writeInteger(w, value);
  } else {
    writeFloat(w, value);
  }
}

const MODE = {
  MAP: 0 as const,
  ARRAY: 1 as const,
};

type Loop = {
  mode: typeof MODE.MAP;
  prop: boolean;
  isMap: boolean;
  value: unknown;
  index: number;
  length: number;
  entries: readonly [unknown, unknown][];
} | {
  mode: typeof MODE.ARRAY;
  value: readonly unknown[];
  index: number;
  length: number;
};

export interface WriteOptions {
  readonly isSafeMapKey?:
    | ((key: unknown, map: Map<unknown, unknown>) => boolean)
    | undefined;
  readonly isSafeObjectKey?:
    | ((key: string, obj: Record<string, unknown>) => boolean)
    | undefined;
}

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/formatters/cbor/others/#write)
 */
export function write(
  w: Writer,
  value: unknown,
  options: WriteOptions | undefined = {},
): void {
  const {
    isSafeMapKey = k => k !== "__proto__" && k !== "constructor",
    isSafeObjectKey = k => k !== "__proto__" && k !== "constructor",
  } = options;
  let loop: Loop | undefined;
  const loopParents: Loop[] = [];

  function begin(parent: Loop): void {
    if (w.depth >= w.maxDepth) {
      throw new CborMaxDepthReachedError(w.maxDepth);
    }

    w.depth += 1;
    loopParents.push(loop = parent);
  }

  function end(): void {
    loopParents.pop();
    // loopParents が空の場合、loop には初期値と同じ undefined が設定される。
    loop = loopParents[loopParents.length - 1]!;
    w.depth -= 1;
  }

  while (true) {
    switch (typeof value) {
      case "number":
        writeNumber(w, value);
        break;

      case "bigint":
        writeInteger(w, value);
        break;

      case "string":
        writeUtf8String(w, value);
        break;

      case "boolean":
        writeBoolean(w, value);
        break;

      case "object":
      case "undefined":
        switch (true) {
          case value == null:
            writeNullable(w, value);
            break;

          case typeof (value as ToCBOR).toCBOR === "function": {
            const tagged = (value as ToCBOR).toCBOR(w);

            if (Array.isArray(tagged)) {
              if (tagged.length === 2) {
                writeTag(w, tagged[0]);
                value = tagged[1];
                continue; // loop ではないので抜け出さないようにする。
              } else if (tagged.length === 1) {
                value = tagged[0];
                continue; // loop ではないので抜け出さないようにする。
              } else {
                throw new SurrealTypeError(
                  "an array of length 1 or 2",
                  `an array of length ${(tagged as any[]).length}`,
                );
              }
            }

            break;
          }

          case Array.isArray(value):
          case value instanceof Set: {
            const array = [...value];
            writeHeader(w, MT_ARRAY, array.length);

            if (array.length <= 0) {
              break;
            }

            begin({
              mode: MODE.ARRAY,
              value: array,
              index: 0,
              length: array.length,
            });
            break;
          }

          case isPlainObject(value):
          case value instanceof Map:
            const entries = value instanceof Map
              ? [...value.entries()]
              : Object.entries(value);
            writeHeader(w, MT_MAP, entries.length);

            if (entries.length <= 0) {
              break;
            }

            begin({
              mode: MODE.MAP,
              prop: true,
              isMap: value instanceof Map,
              value,
              index: 0,
              length: entries.length,
              entries,
            });
            break;

          case value instanceof Uint8Array:
            writeByteString(w, value);
            break;

          case value instanceof Simple:
            writeHeader(w, MT_SIMPLE_FLOAT, value.value);
            break;

          default:
            throw new SurrealTypeError(
              "Object | Array | Map | Set | Uint8Array",
              String(value),
            );
        }

        break;

      case "symbol":
      case "function":
        throw new SurrealTypeError(
          "number | bigint | string | boolean | object | undefined | null",
          typeof value,
        );

      default:
        unreachable();
    }

    if (!loop) {
      break;
    }

    switch (loop.mode) {
      case MODE.MAP:
        if (loop.prop) {
          loop.prop = false;
          value = loop.entries[loop.index]![0];

          if (
            loop.isMap
              ? !isSafeMapKey(value, loop.value as any)
              : !isSafeObjectKey(value as string, loop.value as any)
          ) {
            throw new CborUnsafeMapKeyError(value);
          }
        } else {
          loop.prop = true;
          value = loop.entries[loop.index]![1];

          if (++loop.index === loop.length) {
            end();
          }
        }

        break;

      case MODE.ARRAY:
        value = loop.value[loop.index];

        if (++loop.index === loop.length) {
          end();
        }

        break;

      default:
        unreachable(loop);
    }
  }
}
