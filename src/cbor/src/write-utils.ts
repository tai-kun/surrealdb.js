import {
  CborMaxDepthReachedError,
  CborUnsafeMapKeyError,
  CircularReferenceError,
  NumberRangeError,
  SurrealTypeError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import type { Uint8ArrayLike } from "@tai-kun/surrealdb/types";
import { utf8 } from "@tai-kun/surrealdb/utils";
import isPlainObject from "is-plain-obj";
import { ianaReplacer } from "./iana";
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
  HEADER_UNDEFINED,
  JS_MAX_SAFE_UNSIGNED_INTEGER,
  type MajorType,
  MT_BYTE_STRING,
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writepayload)
 */
export function writePayload(
  w: Writer,
  value: Uint8ArrayLike,
): void {
  w.writeBytes(value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writebytestring)
 */
export function writeByteString(
  w: Writer,
  value: Uint8ArrayLike,
): void {
  writeHeader(w, MT_BYTE_STRING, value.length);
  writePayload(w, value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writeutf8string)
 */
export function writeUtf8String(w: Writer, value: string): void {
  let l = value.length;

  // パフォーマンスのために `.encodeInto` を使ってバッファーに直接書き込む。
  // 文字列を UTF-8 でエンコードするとき、必要なバッファーのサイズは `.length` バイト以上
  // `.length * 3` バイト以下である [^1]。さらに CBOR のヘッダーを書き込むために最大 5 バイトの
  // 空き容量が追加で必要となる。つまりメモリーの空き容量が `.length * 3 + 5` バイト以上であれば
  // `.encodeInto` を使うことができる。
  // [^1]: https://developer.mozilla.org/ja/docs/Web/API/TextEncoder/encodeInto#%E3%83%90%E3%83%83%E3%83%95%E3%82%A1%E3%83%BC%E3%81%AE%E5%A4%A7%E3%81%8D%E3%81%95
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
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writeencodedutf8string)
 */
export function writeEncodedUtf8String(
  w: Writer,
  value: Uint8ArrayLike,
): void {
  const length = value.length;

  w.claim(9); // 1 (header) + 8 (64-bit payload)

  if (length < AI_ONE_BYTE) {
    w.data[w.offset++] = 96 + length; // (120 - 1 - 23) + length
  } else if (length <= 0xff) {
    w.data[w.offset++] = 120; // (MT_UTF8_STRING << 5) | AI_ONE_BYTE
    w.data[w.offset++] = length;
  } else if (length <= 0xffff) {
    w.data[w.offset++] = 121; // (MT_UTF8_STRING << 5) | AI_TWO_BYTES
    w.view.setUint16(w.offset, length);
    w.offset += 2;
  } else if (length <= 0xffffffff) {
    w.data[w.offset++] = 122; // (MT_UTF8_STRING << 5) | AI_FOUR_BYTES
    w.view.setUint32(w.offset, length);
    w.offset += 4;
  } else if (length <= JS_MAX_SAFE_UNSIGNED_INTEGER) {
    w.data[w.offset++] = 123; // (MT_UTF8_STRING << 5) | AI_EIGHT_BYTES
    w.view.setBigUint64(w.offset, BigInt(length));
    w.offset += 8;
  } else {
    throw new NumberRangeError([0, JS_MAX_SAFE_UNSIGNED_INTEGER], length);
  }
  // エンコードした文字列が JavaScript 以外でデコードされる可能性を考えると、JavaScript の制約に
  // したがった文字列長の検証をする必要はないかもしれない。
  // } else if (length <= 6442450941) { // (2^31-1)*3
  //   w.data[w.offset++] = 123; // (MT_UTF8_STRING << 5) | AI_EIGHT_BYTES
  //   w.view.setBigUint64(w.offset, BigInt(length));
  //   w.offset += 8;
  // } else {
  //   throw new NumberRangeError([0, 6442450941], length);
  // }

  w.writeBytes(value);
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writenullable)
 */
export function writeNullable(w: Writer, value: null | undefined): void {
  if (value === null) {
    w.writeUint8(HEADER_NULL);
  } else {
    w.writeUint8(HEADER_UNDEFINED);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writeboolean)
 */
export function writeBoolean(w: Writer, value: boolean): void {
  if (value) {
    w.writeUint8(HEADER_TRUE);
  } else {
    w.writeUint8(HEADER_FALSE);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/others/#writenumber)
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

const isTagged = (value: {}): value is ToCBOR =>
  typeof (value as ToCBOR).toCBOR === "function";

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
      w.writeUint8(HEADER_UNDEFINED);
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
      // TODO(tai-kun): エラーメッセージを改善
      throw new CircularReferenceError(String(value));
    } else if (isTagged(value)) {
      const cbor = (value as ToCBOR).toCBOR(w);

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
          throw new SurrealTypeError(
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
        "number | bigint | string | boolean | object | undefined | null",
        typeof value,
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
