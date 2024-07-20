import { unreachable } from "@tai-kun/surreal/errors";
import isPlainObject from "is-plain-obj";
import {
  AI_EIGHT_BYTES,
  AI_FOUR_BYTES,
  AI_ONE_BYTE,
  AI_TWO_BYTES,
  type DataItem,
  HEADER_FALSE,
  HEADER_FLOAT_DOUBLE,
  HEADER_NULL,
  HEADER_TRUE,
  HEADER_UNDEFINED,
  type MajorType,
  MT_ARRAY,
  MT_BYTE_STRING,
  MT_MAP,
  MT_NEGATIVE_INTEGER,
  MT_TAG,
  MT_UNSIGNED_INTEGER,
  MT_UTF8_STRING,
} from "./spec";
import utf8 from "./utf8";
import type { default as Writer, ToCBOR } from "./Writer";

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

export function writePayload(w: Writer, value: Uint8Array): void {
  w.writeBytes(value);
}

export function writeInt(w: Writer, value: number | bigint): void {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new Error("invalid int");
    }

    // 整数とヘッダーの書き込み処理は同じなので、それぞれの意味は異なるけど再利用する。
    if (value >= 0) {
      writeHeader(w, MT_UNSIGNED_INTEGER, value === -0 ? 0 : value);
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

export function writeNumber(w: Writer, value: number | bigint): void {
  if (typeof value === "bigint" || Number.isInteger(value)) {
    writeInt(w, value);
  } else {
    writeFloat64(w, value);
  }
}

export function writeByteString(w: Writer, value: Uint8Array): void {
  writeHeader(w, MT_BYTE_STRING, value.length);
  writePayload(w, value);
}

export function writeUtf8String(w: Writer, value: string): void {
  const bytes = utf8.encode(value);
  writeHeader(w, MT_UTF8_STRING, bytes.length);
  writePayload(w, bytes);
}

export function writeEncodedUtf8String(w: Writer, value: Uint8Array): void {
  writeHeader(w, MT_UTF8_STRING, value.length);
  writePayload(w, value);
}

export function writeTag(w: Writer, value: DataItem.Tag["value"]): void {
  writeHeader(w, MT_TAG, value);
}

export function writeNullable(w: Writer, value: null | undefined): void {
  w.writeUint8(value === null ? HEADER_NULL : HEADER_UNDEFINED);
}

export function writeBoolean(w: Writer, value: boolean): void {
  w.writeUint8(value ? HEADER_TRUE : HEADER_FALSE);
}

// TODO(tai-kun): impl
// export function writeSimple()

// TODO(tai-kun): impl
// export function writeFloat16()
// export function writeFloat32()

export function writeFloat64(w: Writer, value: number): void {
  w.writeUint8(HEADER_FLOAT_DOUBLE);
  w.writeFloat64(value); // payload
}

const MODE = {
  MAP: 0 as const,
  ARRAY: 1 as const,
};

type Loop = {
  mode: typeof MODE.MAP;
  prop: boolean;
  value: readonly [unknown, unknown][];
  index: number;
  length: number;
} | {
  mode: typeof MODE.ARRAY;
  value: readonly unknown[];
  index: number;
  length: number;
};

export function write(w: Writer, value: unknown): void {
  let loop: Loop | undefined;
  let loopDepth = 0;
  const loopParents: Loop[] = [];

  function begin(parent: Loop): void {
    if (loopDepth >= w.maxDepth) {
      throw new Error(`Max depth: ${loopDepth}`);
    }

    loopDepth += 1;
    loopParents.push(loop = parent);
  }

  function end(): void {
    loopParents.pop();
    // loopParents が空の場合、loop には初期値と同じ undefined が設定される。
    loop = loopParents[loopParents.length - 1]!;
    loopDepth -= 1;
  }

  while (true) {
    switch (typeof value) {
      case "number":
        writeNumber(w, value);
        break;

      case "bigint":
        writeInt(w, value);
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

          case Array.isArray(value):
          case value instanceof Set: {
            const vec = [...value];
            writeHeader(w, MT_ARRAY, vec.length);
            begin({
              mode: MODE.ARRAY,
              value: vec,
              index: 0,
              length: vec.length,
            });
            break;
          }

          case typeof (value as ToCBOR).toCBOR === "function": {
            const tagged = (value as ToCBOR).toCBOR(w);

            if (Array.isArray(tagged)) {
              if (tagged.length === 2) {
                writeTag(w, tagged[0]);
                value = tagged[1];
              } else if (tagged.length === 1) {
                value = tagged[0];
              }
            }

            break;
          }

          case isPlainObject(value):
          case value instanceof Map:
            const entries = value instanceof Map
              ? [...value.entries()]
              : Object.entries(value);
            writeHeader(w, MT_MAP, entries.length);
            begin({
              mode: MODE.MAP,
              prop: true,
              value: entries,
              index: 0,
              length: entries.length,
            });
            break;

          case value instanceof Uint8Array:
            writeByteString(w, value);
            break;

          default:
            throw TypeError("unkown object");
        }

        break;

      case "symbol":
      case "function":
        throw new TypeError();

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
          value = loop.value[loop.index]![0];
        } else {
          loop.prop = true;
          value = loop.value[loop.index]![1];

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
