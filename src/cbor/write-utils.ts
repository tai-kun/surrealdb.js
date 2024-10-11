import {
  CborMaxDepthReachedError,
  CborUnsafeMapKeyError,
  CircularReferenceError,
  NumberRangeError,
  SurrealTypeError,
  SurrealValueError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import type { Uint8ArrayLike } from "@tai-kun/surrealdb/types";
import { isPlainObject, utf8 } from "@tai-kun/surrealdb/utils";
import { ianaReplacer } from "./_iana";
import {
  AI_EIGHT_BYTES,
  AI_FOUR_BYTES,
  AI_ONE_BYTE,
  AI_TWO_BYTES,
  CBOR_MAX_UNSIGNED_INTEGER,
  CBOR_MIN_NEGATIVE_INTEGER,
  HEADER_FALSE,
  HEADER_FLOAT_DOUBLE,
  HEADER_FLOAT_HALF,
  HEADER_NULL,
  HEADER_TRUE,
  JS_MAX_SAFE_UNSIGNED_INTEGER,
  type MajorType,
  MT_BYTE_STRING,
  Simple,
} from "./spec";
import { canToCBOR, type ToCBOR } from "./traits";
import type { Writer } from "./writer";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#writeheader)
 */
export function writeHeader(
  w: Writer,
  mt: MajorType,
  length: number | bigint,
): void {
  switch (true) {
    case length < AI_ONE_BYTE:
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#writepayload)
 */
export function writePayload(
  w: Writer,
  value: Uint8ArrayLike,
): void {
  w.writeBytes(value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#writebytestring)
 */
export function writeByteString(
  w: Writer,
  value: Uint8ArrayLike,
): void {
  writeHeader(w, MT_BYTE_STRING, value.length);
  writePayload(w, value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#writeutf8string)
 */
export function writeUtf8String(w: Writer, value: string): void {
  let l = value.length;

  if (l <= 0) {
    w.claim(1);
    w.data[w.offset++] = 96; // 120 - 1 - 23

    return;
  }

  switch (l) {
    case 2:
      switch (value) {
        case "ns":
          w.claim(3);
          w.data[w.offset++] = 98; // 96 + 2
          w.data.set([0x6E, 0x73], w.offset);
          w.offset += 2;
          return;

        case "db":
          w.claim(3);
          w.data[w.offset++] = 98; // 96 + 2
          w.data.set([0x64, 0x62], w.offset);
          w.offset += 2;
          return;

        case "ac":
          w.claim(3);
          w.data[w.offset++] = 98; // 96 + 2
          w.data.set([0x61, 0x63], w.offset);
          w.offset += 2;
          return;
      }

      break;

    case 3:
      switch (value) {
        case "use":
          w.claim(4);
          w.data[w.offset++] = 99; // 96 + 3
          w.data.set([0x75, 0x73, 0x65], w.offset);
          w.offset += 3;
          return;

        case "let":
          w.claim(4);
          w.data[w.offset++] = 99; // 96 + 3
          w.data.set([0x6C, 0x65, 0x74], w.offset);
          w.offset += 3;
          return;

        case "run":
          w.claim(4);
          w.data[w.offset++] = 99; // 96 + 3
          w.data.set([0x72, 0x75, 0x6E], w.offset);
          w.offset += 3;
          return;
      }

      break;

    case 4:
      switch (value) {
        case "user":
          w.claim(5);
          w.data[w.offset++] = 100; // 96 + 4
          w.data.set([0x75, 0x73, 0x65, 0x72], w.offset);
          w.offset += 4;
          return;

        case "pass":
          w.claim(5);
          w.data[w.offset++] = 100; // 96 + 4
          w.data.set([0x70, 0x61, 0x73, 0x73], w.offset);
          w.offset += 4;
          return;

        case "ping":
          w.claim(5);
          w.data[w.offset++] = 100; // 96 + 4
          w.data.set([0x70, 0x69, 0x6E, 0x67], w.offset);
          w.offset += 4;
          return;

        case "info":
          w.claim(5);
          w.data[w.offset++] = 100; // 96 + 4
          w.data.set([0x69, 0x6E, 0x66, 0x6F], w.offset);
          w.offset += 4;
          return;

        case "live":
          w.claim(5);
          w.data[w.offset++] = 100; // 96 + 4
          w.data.set([0x6C, 0x69, 0x76, 0x65], w.offset);
          w.offset += 4;
          return;

        case "kill":
          w.claim(5);
          w.data[w.offset++] = 100; // 96 + 4
          w.data.set([0x6B, 0x69, 0x6C, 0x6C], w.offset);
          w.offset += 4;
          return;
      }

      break;

    case 5:
      switch (value) {
        case "unset":
          w.claim(6);
          w.data[w.offset++] = 101; // 96 + 5
          w.data.set([0x75, 0x6E, 0x73, 0x65, 0x74], w.offset);
          w.offset += 5;
          return;

        case "query":
          w.claim(6);
          w.data[w.offset++] = 101; // 96 + 5
          w.data.set([0x71, 0x75, 0x65, 0x72, 0x79], w.offset);
          w.offset += 5;
          return;

        case "merge":
          w.claim(6);
          w.data[w.offset++] = 101; // 96 + 5
          w.data.set([0x6D, 0x65, 0x72, 0x67, 0x65], w.offset);
          w.offset += 5;
          return;

        case "patch":
          w.claim(6);
          w.data[w.offset++] = 101; // 96 + 5
          w.data.set([0x70, 0x61, 0x74, 0x63, 0x68], w.offset);
          w.offset += 5;
          return;
      }

      break;

    case 6:
      switch (value) {
        case "method":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x6D, 0x65, 0x74, 0x68, 0x6F, 0x64], w.offset);
          w.offset += 6;
          return;

        case "params":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x70, 0x61, 0x72, 0x61, 0x6D, 0x73], w.offset);
          w.offset += 6;
          return;

        case "signup":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x73, 0x69, 0x67, 0x6E, 0x75, 0x70], w.offset);
          w.offset += 6;
          return;

        case "signin":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x73, 0x69, 0x67, 0x6E, 0x69, 0x6E], w.offset);
          w.offset += 6;
          return;

        case "select":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x73, 0x65, 0x6C, 0x65, 0x63, 0x74], w.offset);
          w.offset += 6;
          return;

        case "create":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x63, 0x72, 0x65, 0x61, 0x74, 0x65], w.offset);
          w.offset += 6;
          return;

        case "insert":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x69, 0x6E, 0x73, 0x65, 0x72, 0x74], w.offset);
          w.offset += 6;
          return;

        case "update":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x75, 0x70, 0x64, 0x61, 0x74, 0x65], w.offset);
          w.offset += 6;
          return;

        case "upsert":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x75, 0x70, 0x73, 0x65, 0x72, 0x74], w.offset);
          w.offset += 6;
          return;

        case "delete":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x64, 0x65, 0x6C, 0x65, 0x74, 0x65], w.offset);
          w.offset += 6;
          return;

        case "relate":
          w.claim(7);
          w.data[w.offset++] = 102; // 96 + 6
          w.data.set([0x72, 0x65, 0x6C, 0x61, 0x74, 0x65], w.offset);
          w.offset += 6;
          return;
      }

      break;

    case 7:
      switch (value) {
        case "version":
          w.claim(8);
          w.data[w.offset++] = 103; // 96 + 7
          w.data.set([0x76, 0x65, 0x72, 0x73, 0x69, 0x6F, 0x6E], w.offset);
          w.offset += 7;
          return;
      }

      break;

    case 10:
      switch (value) {
        case "invalidate":
          w.claim(11);
          w.data[w.offset++] = 106; // 96 + 10
          w.data.set([
            0x69,
            0x6E,
            0x76,
            0x61,
            0x6C,
            0x69,
            0x64,
            0x61,
            0x74,
            0x65,
          ], w.offset);
          w.offset += 10;
          return;
      }

      break;

    case 12:
      switch (value) {
        case "authenticate":
          w.claim(13);
          w.data[w.offset++] = 108; // 96 + 12
          w.data.set([
            0x61,
            0x75,
            0x74,
            0x68,
            0x65,
            0x6E,
            0x74,
            0x69,
            0x63,
            0x61,
            0x74,
            0x65,
          ], w.offset);
          w.offset += 12;
          return;
      }

      break;
  }

  // パフォーマンスのために `.encodeInto` を使ってバッファーに直接書き込む。
  // 文字列を UTF-8 でエンコードするとき、必要なバッファーのサイズは `.length` バイト以上
  // `.length * 3` バイト以下である [^1]。さらに CBOR のヘッダーを書き込むために最大 5 バイトの
  // 空き容量が追加で必要となる。つまりメモリーの空き容量が `.length * 3 + 5` バイト以上であれば
  // `.encodeInto` を使うことができる。
  // [^1]: https://developer.mozilla.org/docs/Web/API/TextEncoder/encodeInto
  if ((w.data.length - w.offset) >= (5 + l + l + l)) {
    const r = utf8.encodeInto(value, w.data.subarray(w.offset + 5));

    if (r.written < AI_ONE_BYTE) {
      w.data[w.offset++] = 96 + r.written; // (120 - 1 - 23) + value
      l = 4;
    } else if (r.written <= 0xff) {
      w.data[w.offset++] = 120; // (MT_UTF8_STRING << 5) | AI_ONE_BYTE
      w.data[w.offset++] = r.written;
      l = 3;
    } else if (r.written <= 0xffff) {
      w.data[w.offset++] = 121; // (MT_UTF8_STRING << 5) | AI_TWO_BYTES
      w.view.setUint16(w.offset, r.written);
      w.offset += 2;
      l = 2;
    } else { // else if (r.written <= 2147483647 < 0xffffffff)
      w.data[w.offset++] = 122; // (MT_UTF8_STRING << 5) | AI_FOUR_BYTES
      w.view.setUint32(w.offset, r.written);
      w.offset += 4;
      l = 0;
    }

    if (l > 0) {
      w.data.copyWithin(w.offset, l += w.offset, l + r.written);
    }

    w.offset += r.written;
  } else {
    const bytes = utf8.encode(value);
    writeEncodedUtf8String(w, bytes);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#writeencodedutf8string)
 */
export function writeEncodedUtf8String(
  w: Writer,
  value: Uint8ArrayLike,
): void {
  const l = value.length;

  if (l <= 0) {
    w.claim(1);
    w.data[w.offset++] = 96; // 120 - 1 - 23

    return;
  }

  w.claim(9); // 1 (header) + 8 (64-bit payload)

  if (l < AI_ONE_BYTE) {
    w.data[w.offset++] = 96 + l; // (120 - 1 - 23) + l
  } else if (l <= 0xff) {
    w.data[w.offset++] = 120; // (MT_UTF8_STRING << 5) | AI_ONE_BYTE
    w.data[w.offset++] = l;
  } else if (l <= 0xffff) {
    w.data[w.offset++] = 121; // (MT_UTF8_STRING << 5) | AI_TWO_BYTES
    w.view.setUint16(w.offset, l);
    w.offset += 2;
  } else if (l <= 0xffffffff) {
    w.data[w.offset++] = 122; // (MT_UTF8_STRING << 5) | AI_FOUR_BYTES
    w.view.setUint32(w.offset, l);
    w.offset += 4;
  } else if (l <= JS_MAX_SAFE_UNSIGNED_INTEGER) {
    w.data[w.offset++] = 123; // (MT_UTF8_STRING << 5) | AI_EIGHT_BYTES
    w.view.setBigUint64(w.offset, BigInt(l));
    w.offset += 8;
  } else {
    throw new NumberRangeError([0, JS_MAX_SAFE_UNSIGNED_INTEGER], l);
  }
  // エンコードした文字列が JavaScript 以外でデコードされる可能性を考えると、JavaScript の制約に
  // したがった文字列長の検証をする必要はないかもしれない。
  // } else if (l <= 6442450941) { // (2^31-1)*3
  //   w.data[w.offset++] = 123; // (MT_UTF8_STRING << 5) | AI_EIGHT_BYTES
  //   w.view.setBigUint64(w.offset, BigInt(l));
  //   w.offset += 8;
  // } else {
  //   throw new NumberRangeError([0, 6442450941], l);
  // }

  w.writeBytes(value);
}

function writeUndefined(w: Writer): void {
  // 仕様では HEADER_UNDEFINED を書き込むほうが正しいと思われるが、SurrealDB は undefined と
  //  NONE が同値でもタグ付きデータアイテムで NONE を表現する必要がある。
  // w.writeUint8(HEADER_UNDEFINED);

  // https://github.com/surrealdb/surrealdb/blob/v2.0.1/core/src/rpc/format/cbor/convert.rs#L30
  // より、NONE のタグは 6
  w.claim(2); // 1 (header) + 1 (`null` payload)
  w.data[w.offset++] = 198; // 192 + 6 = 198
  w.data[w.offset++] = HEADER_NULL;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#writenullable)
 */
export function writeNullable(w: Writer, value: null | undefined): void {
  if (value === null) {
    w.writeUint8(HEADER_NULL);
  } else {
    writeUndefined(w);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#writeboolean)
 */
export function writeBoolean(w: Writer, value: boolean): void {
  if (value) {
    w.writeUint8(HEADER_TRUE);
  } else {
    w.writeUint8(HEADER_FALSE);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#writenumber)
 */
export function writeNumber(w: Writer, value: number): void {
  if (Number.isInteger(value)) {
    if (value >= 0) {
      w.claim(9); // 1 (header) + 8 (64-bit payload)

      if (value < AI_ONE_BYTE) {
        w.data[w.offset++] = value;
      } else if (value <= 0xff) {
        w.data[w.offset++] = AI_ONE_BYTE;
        w.data[w.offset++] = value;
      } else if (value <= 0xffff) {
        w.data[w.offset++] = AI_TWO_BYTES;
        w.view.setUint16(w.offset, value);
        w.offset += 2;
      } else if (value <= 0xffffffff) {
        w.data[w.offset++] = AI_FOUR_BYTES;
        w.view.setUint32(w.offset, value);
        w.offset += 4;
      } else if (value <= JS_MAX_SAFE_UNSIGNED_INTEGER) {
        w.data[w.offset++] = AI_EIGHT_BYTES;
        w.view.setBigUint64(w.offset, BigInt(value));
        w.offset += 8;
      } else {
        throw new NumberRangeError(
          [
            -JS_MAX_SAFE_UNSIGNED_INTEGER,
            JS_MAX_SAFE_UNSIGNED_INTEGER,
          ],
          value,
        );
      }
    } else {
      const ui = -value - 1;

      w.claim(9); // 1 (header) + 8 (64-bit payload)

      if (ui < AI_ONE_BYTE) {
        w.data[w.offset++] = 32 + ui; // value = -24 -> ui = 23 -> 32 + 23 = 55
      } else if (ui <= 0xff) {
        w.data[w.offset++] = 56; // (MT_NEGATIVE_INTEGER << 5) | AI_ONE_BYTE
        w.data[w.offset++] = ui;
      } else if (ui <= 0xffff) {
        w.data[w.offset++] = 57; // (MT_NEGATIVE_INTEGER << 5) | AI_TWO_BYTES
        w.view.setUint16(w.offset, ui);
        w.offset += 2;
      } else if (ui <= 0xffffffff) {
        w.data[w.offset++] = 58; // (MT_NEGATIVE_INTEGER << 5) | AI_FOUR_BYTES
        w.view.setUint32(w.offset, ui);
        w.offset += 4;
      } else if (ui <= JS_MAX_SAFE_UNSIGNED_INTEGER) {
        w.data[w.offset++] = 59; // (MT_NEGATIVE_INTEGER << 5) | AI_EIGHT_BYTES
        w.view.setBigUint64(w.offset, BigInt(ui));
        w.offset += 8;
      } else {
        throw new NumberRangeError(
          [
            -JS_MAX_SAFE_UNSIGNED_INTEGER,
            JS_MAX_SAFE_UNSIGNED_INTEGER,
          ],
          value,
        );
      }
    }
  } else if (value === Infinity) {
    w.claim(3); // 1 (header) + 2 (16-bit payload)

    w.data[w.offset++] = HEADER_FLOAT_HALF;
    w.data[w.offset++] = 0x7c;
    w.data[w.offset++] = 0x00;
  } else if (value === -Infinity) {
    w.claim(3); // 1 (header) + 2 (16-bit payload)

    w.data[w.offset++] = HEADER_FLOAT_HALF;
    w.data[w.offset++] = 0xfc;
    w.data[w.offset++] = 0x00;
  } else if (value === value) {
    w.claim(9); // 1 (header) + 8 (64-bit payload)

    w.data[w.offset++] = HEADER_FLOAT_DOUBLE;
    w.view.setFloat64(w.offset, value);
    w.offset += 8;
  } else {
    w.claim(3); // 1 (header) + 2 (16-bit payload)

    w.data[w.offset++] = HEADER_FLOAT_HALF;
    w.data[w.offset++] = 0x7e;
    w.data[w.offset++] = 0x00;
  }
}

export function writeBigInt(w: Writer, value: bigint): void {
  if (value >= 0) {
    w.claim(9); // 1 (header) + 8 (64-bit payload)

    if (value < AI_ONE_BYTE) {
      w.data[w.offset++] = Number(value);
    } else if (value <= 0xff) {
      w.data[w.offset++] = AI_ONE_BYTE;
      w.data[w.offset++] = Number(value);
    } else if (value <= 0xffff) {
      w.data[w.offset++] = AI_TWO_BYTES;
      w.view.setUint16(w.offset, Number(value));
      w.offset += 2;
    } else if (value <= 0xffffffff) {
      w.data[w.offset++] = AI_FOUR_BYTES;
      w.view.setUint32(w.offset, Number(value));
      w.offset += 4;
    } else if (value <= CBOR_MAX_UNSIGNED_INTEGER) {
      w.data[w.offset++] = AI_EIGHT_BYTES;
      w.view.setBigUint64(w.offset, value);
      w.offset += 8;
    } else {
      throw new NumberRangeError(
        [
          CBOR_MIN_NEGATIVE_INTEGER,
          CBOR_MAX_UNSIGNED_INTEGER,
        ],
        value,
      );
    }
  } else {
    const ui = -value - 1n;

    w.claim(9); // 1 (header) + 8 (64-bit payload)

    if (ui < AI_ONE_BYTE) {
      w.data[w.offset++] = 32 + Number(ui); // value = -24 -> ui = 23 -> 32 + 23 = 55
    } else if (ui <= 0xff) {
      w.data[w.offset++] = 56; // (MT_NEGATIVE_INTEGER << 5) | AI_ONE_BYTE
      w.data[w.offset++] = Number(ui);
    } else if (ui <= 0xffff) {
      w.data[w.offset++] = 57; // (MT_NEGATIVE_INTEGER << 5) | AI_TWO_BYTES
      w.view.setUint16(w.offset, Number(ui));
      w.offset += 2;
    } else if (ui <= 0xffffffff) {
      w.data[w.offset++] = 58; // (MT_NEGATIVE_INTEGER << 5) | AI_FOUR_BYTES
      w.view.setUint32(w.offset, Number(ui));
      w.offset += 4;
    } else if (ui <= CBOR_MAX_UNSIGNED_INTEGER) {
      w.data[w.offset++] = 59; // (MT_NEGATIVE_INTEGER << 5) | AI_EIGHT_BYTES
      w.view.setBigUint64(w.offset, ui);
      w.offset += 8;
    } else {
      throw new NumberRangeError(
        [
          CBOR_MIN_NEGATIVE_INTEGER,
          CBOR_MAX_UNSIGNED_INTEGER,
        ],
        value,
      );
    }
  }
}

/**
 * @internal
 */
function writeArrayHeader(w: Writer, length: number): void {
  w.claim(9); // 1 (header) + 8 (64-bit payload)

  if (length < AI_ONE_BYTE) {
    w.data[w.offset++] = 128 + length; // 128 + 23 = 151
  } else if (length <= 0xff) {
    w.data[w.offset++] = 152; // (MT_ARRAY << 5) | AI_ONE_BYTE
    w.data[w.offset++] = length;
  } else if (length <= 0xffff) {
    w.data[w.offset++] = 153; // (MT_ARRAY << 5) | AI_TWO_BYTES
    w.view.setUint16(w.offset, length);
    w.offset += 2;
  } else if (length <= 0xffffffff) {
    w.data[w.offset++] = 154; // (MT_ARRAY << 5) | AI_FOUR_BYTES
    w.view.setUint32(w.offset, length);
    w.offset += 4;
  } else if (length <= JS_MAX_SAFE_UNSIGNED_INTEGER) {
    w.data[w.offset++] = 155; // (MT_ARRAY << 5) | AI_EIGHT_BYTES
    w.view.setBigUint64(w.offset, BigInt(length));
    w.offset += 8;
  } else {
    throw new NumberRangeError([0, JS_MAX_SAFE_UNSIGNED_INTEGER], length);
  }
}

/**
 * @internal
 */
function writeMapHeader(w: Writer, length: number): void {
  w.claim(9); // 1 (header) + 8 (64-bit payload)

  if (length < AI_ONE_BYTE) {
    w.data[w.offset++] = 160 + length; // 160 + 23 = 183
  } else if (length <= 0xff) {
    w.data[w.offset++] = 184; // (MT_MAP << 5) | AI_ONE_BYTE
    w.data[w.offset++] = length;
  } else if (length <= 0xffff) {
    w.data[w.offset++] = 185; // (MT_MAP << 5) | AI_TWO_BYTES
    w.view.setUint16(w.offset, length);
    w.offset += 2;
  } else if (length <= 0xffffffff) {
    w.data[w.offset++] = 186; // (MT_MAP << 5) | AI_FOUR_BYTES
    w.view.setUint32(w.offset, length);
    w.offset += 4;
  } else if (length <= JS_MAX_SAFE_UNSIGNED_INTEGER) {
    w.data[w.offset++] = 187; // (MT_MAP << 5) | AI_EIGHT_BYTES
    w.view.setBigUint64(w.offset, BigInt(length));
    w.offset += 8;
  } else {
    throw new NumberRangeError([0, JS_MAX_SAFE_UNSIGNED_INTEGER], length);
  }
}

/**
 * @internal
 */
function writeTagHeader(w: Writer, tag: number | bigint): void {
  w.claim(9); // 1 (header) + 8 (64-bit payload)

  if (tag < AI_ONE_BYTE) {
    w.data[w.offset++] = 192 + Number(tag); // 192 + 23 = 215
  } else if (tag <= 0xff) {
    w.data[w.offset++] = 216; // (MT_TAG << 5) | AI_ONE_BYTE
    w.data[w.offset++] = Number(tag);
  } else if (tag <= 0xffff) {
    w.data[w.offset++] = 217; // (MT_TAG << 5) | AI_TWO_BYTES
    w.view.setUint16(w.offset, Number(tag));
    w.offset += 2;
  } else if (tag <= 0xffffffff) {
    w.data[w.offset++] = 218; // (MT_TAG << 5) | AI_FOUR_BYTES
    w.view.setUint32(w.offset, Number(tag));
    w.offset += 4;
  } else if (tag <= JS_MAX_SAFE_UNSIGNED_INTEGER) {
    w.data[w.offset++] = 219; // (MT_TAG << 5) | AI_EIGHT_BYTES
    w.view.setBigUint64(w.offset, BigInt(tag));
    w.offset += 8;
  } else {
    throw new NumberRangeError([0, CBOR_MAX_UNSIGNED_INTEGER], tag);
  }
}

/**
 * @internal
 */
function writeSimpleHeader(w: Writer, value: number): void {
  w.claim(3); // 1 (header) + 2

  if (value < AI_ONE_BYTE) {
    w.data[w.offset++] = 224 + value; // 128 + 23 = 247
  } else if (value <= 0xff) {
    w.data[w.offset++] = 248; // (MT_SIMPLE_FLOAT << 5) | AI_ONE_BYTE
    w.data[w.offset++] = value;
  } else {
    throw new NumberRangeError([0, 0xff], value);
  }
}

const PARENT_SET = 0;
const PARENT_MAP = 1;
const PARENT_OBJ = 2;
const PARENT_TAG = 3;

type Parent = {
  $: typeof PARENT_SET;
  // seen: Set<object>;
  value: readonly unknown[] | ReadonlySet<unknown>;
  index: number;
  length: number;
  target: readonly unknown[];
} | {
  $: typeof PARENT_MAP;
  // seen: Set<object>;
  value: ReadonlyMap<unknown, unknown>;
  index: number;
  length: number;
  isProperty: boolean;
  properties: readonly unknown[];
} | {
  $: typeof PARENT_OBJ;
  // seen: Set<object>;
  value: { readonly [p: string]: unknown };
  index: number;
  length: number;
  isProperty: boolean;
  properties: readonly string[];
} | {
  $: typeof PARENT_TAG;
  value: ToCBOR;
};

const CONTINUE = Symbol.for("@tai-kun/surrealdb/cbor/continue"); // decorder.ts と同じ

export type Replacer = (value: symbol | object) => unknown | typeof CONTINUE;

export type IsSafeMapKey = (
  key: unknown,
  map: ReadonlyMap<unknown, unknown>,
) => boolean;

export type IsSafeObjectKey = (
  key: string | number,
  obj: { readonly [p: string]: unknown },
) => boolean;

export interface WriteOptions {
  readonly isSafeMapKey?: IsSafeMapKey | undefined;
  readonly isSafeObjectKey?: IsSafeObjectKey | undefined;
  readonly replacer?: Replacer | readonly Replacer[] | undefined;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/cbor/others/#write)
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
    : replacer.concat(ianaReplacer);
  let parent: Parent | undefined;
  const parents: Parent[] = [];
  const seen = new Set<{}>();

  function begin(p: Parent): void {
    if (p.$ !== PARENT_TAG && ++w.depth >= w.maxDepth) {
      throw new CborMaxDepthReachedError(w.maxDepth);
    }

    seen.add(p.value);
    parents.push(parent = p);
  }

  let kind;

  while (true) {
    if (value === null) {
      w.writeUint8(HEADER_NULL);
    } else if (value === undefined) {
      writeUndefined(w);
    } else if (value === true) {
      w.writeUint8(HEADER_TRUE);
    } else if (value === false) {
      w.writeUint8(HEADER_FALSE);
    } else if ((kind = typeof value) === "string") {
      writeUtf8String(w, value as string);
    } else if (kind === "number") {
      writeNumber(w, value as number);
    } else if (kind === "bigint") {
      writeBigInt(w, value as bigint);
    } else if (seen.has(value)) {
      throw new CircularReferenceError(value);
    } else if (canToCBOR(value)) {
      const cbor = value.toCBOR(w);

      if (Array.isArray(cbor)) {
        begin({
          $: PARENT_TAG,
          value,
        });

        if (cbor.length === 2) {
          writeTagHeader(w, cbor[0]);
          value = cbor[1];
        } else if (cbor.length === 1) {
          value = cbor[0];
        } else {
          throw new SurrealValueError(
            "an array of length 1 or 2",
            `an array of length ${(cbor as any[]).length}`,
          );
        }

        continue;
      }
    } else if (isPlainObject(value)) {
      const keys = Object.keys(value);
      const length = keys.length;
      writeMapHeader(w, length);

      if (length > 0) {
        begin({
          $: PARENT_OBJ,
          value,
          index: 0,
          length,
          isProperty: true,
          properties: keys,
        });
      }
    } else if (Array.isArray(value) || value instanceof Set) {
      const target = Array.isArray(value) ? value : Array.from(value);
      const length = target.length;
      writeArrayHeader(w, length);

      if (length > 0) {
        begin({
          $: PARENT_SET,
          value,
          index: 0,
          length,
          target,
        });
      }
    } else if (value instanceof Map) {
      const keys = Array.from(value.keys());
      const length = keys.length;
      writeMapHeader(w, length);

      if (length > 0) {
        begin({
          $: PARENT_MAP,
          value,
          index: 0,
          length,
          isProperty: true,
          properties: keys,
        });
      }
    } else if (value instanceof Uint8Array) {
      writeByteString(w, value);
    } else if (value instanceof Simple) {
      writeSimpleHeader(w, value.value);
    } else {
      let replaced = false;

      for (let i = 0, ret; i < replacers.length; i++) {
        if ((ret = replacers[i]!(value)) !== CONTINUE) {
          value = ret;
          replaced = true;
          break;
        }
      }

      if (replaced) {
        continue;
      }

      throw new SurrealTypeError(
        [
          "BigInt",
          "Boolean",
          "null",
          "Number",
          "Object",
          "String",
          "undefined",
        ],
        value,
      );
    }

    // end()
    // .length の比較は === で行うこと。
    while (
      parent
      && (parent.$ === PARENT_TAG || parent.index === parent.length)
    ) {
      if (parent.$ !== PARENT_TAG) {
        w.depth -= 1;
      }

      seen.delete(parent.value);
      parents.pop();
      // parents が空の場合、loop には初期値と同じ undefined が設定される。
      parent = parents[parents.length - 1];
    }

    if (!parent) {
      break;
    }

    if (parent.$ === PARENT_OBJ) {
      if (parent.isProperty) {
        const key = value = parent.properties[parent.index]!;

        if (!isSafeObjectKey(key, parent.value)) {
          throw new CborUnsafeMapKeyError(value);
        }
      } else {
        value = parent.value[parent.properties[parent.index++]!];
      }

      parent.isProperty = !parent.isProperty;
    } else if (parent.$ === PARENT_SET) {
      value = parent.target[parent.index++];
    } else if (parent.$ === PARENT_MAP) {
      if (parent.isProperty) {
        value = parent.properties[parent.index];

        if (!isSafeMapKey(value, parent.value)) {
          throw new CborUnsafeMapKeyError(value);
        }
      } else {
        value = parent.value.get(parent.properties[parent.index++]);
      }

      parent.isProperty = !parent.isProperty;
    } else {
      unreachable(parent);
    }
  }
}
