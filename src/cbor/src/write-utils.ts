import {
  CborMaxDepthReachedError,
  CborUnsafeMapKeyError,
  CircularReferenceError,
  NumberRangeError,
  SurrealTypeError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import { utf8 } from "@tai-kun/surrealdb/utils";
import isPlainObject from "is-plain-obj";
import { ianaReplacer } from "./iana";
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
import type { ToCBOR, Writer } from "./writer";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writeheader)
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writepayload)
 */
export function writePayload(w: Writer, value: Uint8Array): void {
  w.writeBytes(value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writeinteger)
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writebytestring)
 */
export function writeByteString(w: Writer, value: Uint8Array): void {
  writeHeader(w, MT_BYTE_STRING, value.length);
  writePayload(w, value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writeutf8string)
 */
export function writeUtf8String(w: Writer, value: string): void {
  const bytes = utf8.encode(value);
  writeEncodedUtf8String(w, bytes);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writeencodedutf8string)
 */
export function writeEncodedUtf8String(w: Writer, value: Uint8Array): void {
  writeHeader(w, MT_UTF8_STRING, value.length);
  writePayload(w, value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writetag)
 */
export function writeTag(w: Writer, value: DataItem.Tag["value"]): void {
  writeHeader(w, MT_TAG, value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writenullable)
 */
export function writeNullable(w: Writer, value: null | undefined): void {
  w.writeUint8(value === null ? HEADER_NULL : HEADER_UNDEFINED);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writeboolean)
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writefloat)
 */
export function writeFloat(w: Writer, value: number): void {
  if (
    value !== value // NaN
    || value === 0 // -0 も 0 にする。
    || value === Infinity
    || value === -Infinity
  ) {
    writeFloat16(w, value);
  } else {
    writeFloat64(w, value);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writenumber)
 */
export function writeNumber(w: Writer, value: number | bigint): void {
  if (typeof value === "bigint" || Number.isInteger(value)) {
    writeInteger(w, value);
  } else {
    writeFloat(w, value);
  }
}

const MODE = {
  SET: 0 as const,
  MAP: 1 as const,
  OBJ: 2 as const,
};

type Loop = {
  mode: typeof MODE.SET;
  seen: Set<object>;
  value: readonly unknown[] | ReadonlySet<unknown>;
  index: number;
  length: number;
  target: readonly unknown[];
} | {
  mode: typeof MODE.MAP;
  seen: Set<object>;
  value: ReadonlyMap<unknown, unknown>;
  index: number;
  length: number;
  isProperty: boolean;
  properties: readonly unknown[];
} | {
  mode: typeof MODE.OBJ;
  seen: Set<object>;
  value: { readonly [p: string]: unknown };
  index: number;
  length: number;
  isProperty: boolean;
  properties: readonly string[];
};

const CONTINUE = Symbol.for("@tai-kun/surrealdb/cbor/continue"); // decorder.ts と同じ

export type Replacer = (value: symbol | object) => unknown | typeof CONTINUE;

export interface WriteOptions {
  readonly replacer?: Replacer | readonly Replacer[] | undefined;
  readonly isSafeMapKey?:
    | ((key: unknown, map: ReadonlyMap<unknown, unknown>) => boolean)
    | undefined;
  readonly isSafeObjectKey?:
    | ((key: string, obj: { readonly [p: string]: unknown }) => boolean)
    | undefined;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#write)
 */
export function write(
  w: Writer,
  value: unknown,
  options: WriteOptions | undefined = {},
): void {
  const {
    replacer = [],
    isSafeMapKey = k => k !== "__proto__" && k !== "constructor",
    isSafeObjectKey = k => k !== "__proto__" && k !== "constructor",
  } = options;
  const replacers: Replacer[] = typeof replacer === "function"
    ? [replacer, ianaReplacer]
    : [...replacer, ianaReplacer];
  let loop: Loop | undefined;
  const loopParents: Loop[] = [];

  function beginLoop(parent: Loop): void {
    if (++w.depth >= w.maxDepth) {
      throw new CborMaxDepthReachedError(w.maxDepth);
    }

    loopParents.push(loop = parent);
  }

  while (true) {
    let replace = false;

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
            const cbor = (value as ToCBOR).toCBOR(w);

            if (!Array.isArray(cbor)) {
              break; // Writer で書き込み済みと判断して次のステップに進む。
            }

            if (cbor.length === 2) {
              writeTag(w, cbor[0]);
              value = cbor[1];
            } else if (cbor.length === 1) {
              value = cbor[0];
            } else {
              throw new SurrealTypeError(
                "an array of length 1 or 2",
                `an array of length ${(cbor as any[]).length}`,
              );
            }

            continue; // loop ではないので抜け出さないようにする。
          }

          case isPlainObject(value): {
            const properties = Object.keys(value);
            writeHeader(w, MT_MAP, properties.length);

            if (properties.length > 0) {
              const seen = loop?.seen || new Set();

              if (seen.has(value)) {
                // TODO(tai-kun): エラーメッセージを改善
                throw new CircularReferenceError(String(value));
              }

              beginLoop({
                mode: MODE.OBJ,
                seen: seen.add(value),
                value,
                index: 0,
                length: properties.length,
                isProperty: true,
                properties,
              });
            }

            break;
          }

          case Array.isArray(value):
          case value instanceof Set: {
            const target = Array.isArray(value) ? value : Array.from(value);
            writeHeader(w, MT_ARRAY, target.length);

            if (target.length > 0) {
              const seen = loop?.seen || new Set();

              if (seen.has(value)) {
                // TODO(tai-kun): エラーメッセージを改善
                throw new CircularReferenceError(String(value));
              }

              beginLoop({
                mode: MODE.SET,
                seen: seen.add(value),
                value,
                index: 0,
                length: target.length,
                target,
              });
            }

            break;
          }

          case value instanceof Map: {
            const properties = Array.from(value.keys());
            writeHeader(w, MT_MAP, properties.length);

            if (properties.length > 0) {
              const seen = loop?.seen || new Set();

              if (seen.has(value)) {
                // TODO(tai-kun): エラーメッセージを改善
                throw new CircularReferenceError(String(value));
              }

              beginLoop({
                mode: MODE.MAP,
                seen: seen.add(value),
                value,
                index: 0,
                length: properties.length,
                isProperty: true,
                properties,
              });
            }

            break;
          }

          case value instanceof Uint8Array:
            writeByteString(w, value);
            break;

          case value instanceof Simple:
            writeHeader(w, MT_SIMPLE_FLOAT, value.value);
            break;

          default:
            replace = true;
        }

        break;

      default:
        replace = true;
    }

    if (replace) {
      replace = false;

      for (let i = 0, ret; i < replacers.length; i++) {
        if ((ret = replacers[i]!(value as symbol | object)) !== CONTINUE) {
          value = ret;
          replace = true;
          break;
        }
      }

      if (replace) {
        continue;
      }

      throw new SurrealTypeError(
        "number | bigint | string | boolean | object | undefined | null",
        typeof value,
      );
    }

    // .length の比較は === で行うこと。
    while (loop && loop.index === loop.length) {
      // endLoop()
      loop.seen.delete(loop.value);
      loopParents.pop();
      // loopParents が空の場合、loop には初期値と同じ undefined が設定される。
      loop = loopParents[loopParents.length - 1];
      w.depth -= 1;
    }

    if (!loop) {
      break;
    }

    switch (loop.mode) {
      case MODE.OBJ:
        if (loop.isProperty) {
          const key = value = loop.properties[loop.index]!;

          if (!isSafeObjectKey(key, loop.value)) {
            throw new CborUnsafeMapKeyError(value);
          }
        } else {
          value = loop.value[loop.properties[loop.index++]!];
        }

        loop.isProperty = !loop.isProperty;
        break;

      case MODE.SET:
        value = loop.target[loop.index++];
        break;

      case MODE.MAP:
        if (loop.isProperty) {
          value = loop.properties[loop.index];

          if (!isSafeMapKey(value, loop.value)) {
            throw new CborUnsafeMapKeyError(value);
          }
        } else {
          value = loop.value.get(loop.properties[loop.index++]);
        }

        loop.isProperty = !loop.isProperty;
        break;

      default:
        unreachable(loop);
    }
  }
}
