import {
  CborMaxDepthReachedError,
  CborSyntaxError,
  CborTooLittleDataError,
  // CborTooMuchDataError,
  CborUnsafeMapKeyError,
  SurrealValueError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import type { Uint8ArrayLike } from "@tai-kun/surrealdb/types";
import { utf8 } from "@tai-kun/surrealdb/utils";
import { getFloat16 } from "./_float";
import { ianaReviver } from "./_iana";
import {
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
  BREAK,
  JS_MAX_SAFE_UNSIGNED_BIG_INTEGER,
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
import Tagged from "./tagged";

type InputValue = unknown;

const PARENT_ROOT = 0;
const PARENT_STR = 1;
const PARENT_ARR = 2;
const PARENT_OBJ = 3;
const PARENT_MAP = 4;
const PARENT_TAG = 5;

namespace Parent {
  export type Root = {
    readonly $: typeof PARENT_ROOT;
    readonly put: (val: InputValue) => false;
    readonly out: () => unknown;
    val: unknown;
  };

  export namespace Str {
    export type Byte = {
      readonly $: typeof PARENT_STR;
      readonly mt: typeof MT_BYTE_STRING;
      readonly put: (val: InputValue) => boolean;
      readonly out: () => Uint8Array;
      readonly acc: Uint8Array[];
      size: number;
    };

    export type Utf8 = {
      readonly $: typeof PARENT_STR;
      readonly mt: typeof MT_UTF8_STRING;
      readonly put: (val: InputValue) => boolean;
      readonly out: () => string;
      acc: string;
    };
  }

  export type Str =
    | Str.Byte
    | Str.Utf8;

  export type Arr = {
    readonly $: typeof PARENT_ARR;
    readonly put: (val: InputValue) => boolean;
    readonly out: () => unknown[];
    readonly acc: unknown[];
    readonly len: number;
    idx: number;
  };

  export namespace Obj {
    export type Obj = {
      readonly $: typeof PARENT_OBJ;
      readonly put: (val: InputValue) => boolean;
      readonly out: () => { [p: string]: unknown };
      readonly acc: { [p: string]: unknown };
      readonly v8n: IsSafeObjectKey;
      readonly len: number;
      idx: number;
      key: string | number | typeof NONE;
    };

    export type Maq = {
      readonly $: typeof PARENT_MAP;
      readonly put: (val: InputValue) => boolean;
      readonly out: () => Map<unknown, unknown>;
      readonly acc: Map<unknown, unknown>;
      readonly v8n: IsSafeMapKey;
      readonly len: number;
      idx: number;
      key: unknown | typeof NONE;
    };
  }

  export type Obj =
    | Obj.Obj
    | Obj.Maq;

  export type Tag = {
    readonly $: typeof PARENT_TAG;
    readonly put: (val: InputValue) => boolean;
    readonly out: () => unknown;
    readonly fns: readonly TaggedItemReviver[];
    readonly tag: number | bigint;
    val: unknown;
  };
}

type Parent =
  | Parent.Root
  | Parent.Str
  | Parent.Arr
  | Parent.Obj
  | Parent.Tag;

const FRAGMENT_STR = 0;

namespace Fragment {
  export type Str = {
    readonly $: typeof FRAGMENT_STR;
    readonly mt: typeof MT_BYTE_STRING | typeof MT_UTF8_STRING;
    readonly data: Uint8Array;
    readonly size: number;
    offset: number;
  };
}

type Fragment =
  | Fragment.Str
  | never; // ここに追加

const HUMANIZED_DATA_ITEM = {
  [MT_UNSIGNED_INTEGER]: "unsigned integer",
  [MT_NEGATIVE_INTEGER]: "negative integer",
  [MT_BYTE_STRING]: "byte string",
  [MT_UTF8_STRING]: "utf8 string",
  [MT_ARRAY]: "array",
  [MT_MAP]: "map",
  [MT_TAG]: "tagged item",
  [MT_SIMPLE_FLOAT]: "simple/float",
};

const NONE = Symbol.for("@tai-kun/surrealdb/cbor/none");

export const CONTINUE = Symbol.for("@tai-kun/surrealdb/cbor/continue");

export type TaggedItemReviver = (tagged: Tagged) => unknown | typeof CONTINUE;

export type SimpleItemReviver = (simple: Simple) => unknown | typeof CONTINUE;

export interface ReviverObject {
  readonly tagged?: TaggedItemReviver | undefined;
  readonly simple?: SimpleItemReviver | undefined;
}

export type Reviver = (value: Tagged | Simple) => unknown | typeof CONTINUE;

export type IsSafeMapKey = (
  key: unknown,
  map: Map<unknown, unknown>,
) => boolean;

export type IsSafeObjectKey = (
  key: string | number,
  obj: Record<string, unknown>,
) => boolean;

export interface DecoderOptions {
  readonly isSafeMapKey?: IsSafeMapKey | undefined;
  readonly isSafeObjectKey?: IsSafeObjectKey | undefined;
  readonly mapType?: "Object" | "Map" | undefined;
  readonly maxDepth?: number | undefined;
  readonly reviver?:
    | Reviver
    | ReviverObject
    | readonly (Reviver | ReviverObject)[]
    | undefined;
}

export class _Decoder {
  protected readonly mapType: "Object" | "Map";
  protected readonly maxDepth: number;
  protected readonly revivers: {
    tagged: TaggedItemReviver[];
    simple: SimpleItemReviver[];
  };
  protected readonly isSafeMapKey: (
    key: unknown,
    map: Map<unknown, unknown>,
  ) => boolean;
  protected readonly isSafeObjectKey: (
    key: string | number,
    obj: Record<string, unknown>,
  ) => boolean;

  constructor(options: DecoderOptions | undefined = {}) {
    const {
      mapType = "Object",
      reviver,
      maxDepth = 64,
      isSafeMapKey = k => k !== "__proto__" && k !== "constructor",
      isSafeObjectKey = k => k !== "__proto__" && k !== "constructor",
    } = options;
    this.mapType = mapType;
    this.maxDepth = maxDepth;
    this.revivers = toRevivers(reviver);
    this.revivers.tagged.push(compatReviver, ianaReviver);
    this.isSafeMapKey = isSafeMapKey;
    this.isSafeObjectKey = isSafeObjectKey;

    this.depth = 0;
    this.parents = [
      this.parent = {
        $: PARENT_ROOT,
        put(val) {
          if (val === BREAK) {
            // https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-4.4
            throw new CborSyntaxError(
              `The "break" stop code was encountered outside of `
                + "a indefinite-length data item.",
            );
          }

          this.val = val;
          return false;
        },
        out() {
          return this.val;
        },
        val: undefined,
      },
    ];
    this.fragment = null;
  }

  protected depth: number;
  protected readonly parents: [Parent.Root, ...Exclude<Parent, Parent.Root>[]];
  protected parent: Parent;
  protected fragment: Fragment | null;

  protected putValue(value: InputValue): void {
    // @ts-ignore (TS6133): 何故かエラーになる
    let done = false;

    while ((done = this.parent.put(value))) {
      this.end();
      value = this.parents.pop()!.out();
      this.parent = this.parents[this.parents.length - 1]!;
    }
  }

  protected begin(parent: Exclude<Parent, Parent.Root>): void {
    if (parent.$ !== PARENT_STR && ++this.depth >= this.maxDepth) {
      throw new CborMaxDepthReachedError(this.maxDepth);
    }

    this.parents.push(this.parent = parent);
  }

  private end(): void {
    if (this.parent.$ !== PARENT_STR) {
      this.depth -= 1;
    }
  }

  process(input: Uint8ArrayLike): void {
    let offset = 0;
    const fragment = this.fragment;

    if (fragment !== null) {
      switch (fragment.$) {
        case FRAGMENT_STR: {
          const remaining = fragment.size - fragment.offset;
          const chunk = input.subarray(offset, offset += remaining);
          fragment.data.set(chunk, fragment.offset);

          if (chunk.length < remaining) {
            fragment.offset += chunk.length;
            return; // input の最後に到達しているので早期リターン
          }

          let value: string | Uint8ArrayLike = fragment.data;

          if (fragment.mt === MT_UTF8_STRING) {
            value = utf8.decode(value);
          }

          this.putValue(value);
          this.fragment = null;
          break;
        }

        default:
          unreachable(fragment as never);
      }
    }

    const view = new DataView(input.buffer, input.byteOffset, input.byteLength);
    const viewLength = view.byteLength;

    while (offset < viewLength) {
      const ib = view.getUint8(offset++);
      let mt = (ib >> 5) as MajorType;
      let ai = (ib & 0x1f) as AdditionalInfo;
      let value;
      let isSimple = false; // Not a float
      let payloadLength = 0;

      switch (ai) {
        // # Short Data Item (24 <= ai <= 27)
        // +--------------+--------------------------------+---------------------------+-------------------------------------+
        // | Byte count   | 1 byte (CBOR data item header) |    1, 2, 4 or 8 Bytes     |          0 ~ 2^64-1 Bytes           |
        // +--------------+------------+-------------------+---------------------------+-------------------------------------+
        // | Structure    | Major type |  Additional info  | Additional info (Content) |                Payload              |
        // +--------------+------------+-------------------+---------------------------+----------+--------------------------+
        // | Bit count    |   3 Bits   |      5 Bits       |   8, 16, 32 or 64 Bits    |  8 Bits  |           ...            |
        // +--------------+------------+-------------------+---------------------------+----------+--------------------------+
        // | Unsigned Int |     0      |  24, 25, 26, 27   |     0 ~ 2^64-1 (Value)    |                 N/A                 |
        // +--------------+------------+-------------------+---------------------------+-------------------------------------+
        // | Negative Int |     1      |  24, 25, 26, 27   |         0 ~ 2^64-1        |                 N/A                 |
        // +--------------+------------+-------------------+---------------------------+----------+---------+----------------+
        // | Bytes / Text |    2, 3    |  24, 25, 26, 27   |   count := 0 ~ 2^64-1     | bytes[0] |   ...   | bytes[<count>] |
        // +--------------+------------+-------------------+---------------------------+----------+---------+----------------+
        // | Array / Map  |    4, 5    |  24, 25, 26, 27   |    0 ~ 2^64-1 [items]     | N/A (Subsequent data items / pairs) |
        // +--------------+------------+-------------------+---------------------------+-------------------------------------+
        // | Tag          |     6      |  24, 25, 26, 27   |    0 ~ 2^64-1 (Value)     |     N/A (A subsequent data item)    |
        // +--------------+------------+-------------------+---------------------------+-------------------------------------+
        // | Float        |     7      |    25, 26, 27     |     (IEEE 754 Float)      |                 N/A                 |
        // +--------------+------------+-------------------+---------------------------+-------------------------------------+

        case AI_ONE_BYTE: // 24
          payloadLength = 1;
          value = view.getUint8(offset);

          if (mt === MT_SIMPLE_FLOAT) {
            if (value < 0x20) {
              // エンコーダーは、0xf8 (Major Type: 7, Additional Info: 24) で始まり、
              // 0x20 未満のバイトで続く 2 バイトシーケンスを発行してはならない。
              // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.3-5
              // https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-4.2
              throw new CborSyntaxError(
                "2-byte sequence followed by a byte less than 0x20 is being"
                  + " issued after the header 0xf8.",
              );
            }

            isSimple = true;
          }

          break;

        case AI_TWO_BYTES: // 25
          payloadLength = 2;
          value = mt === MT_SIMPLE_FLOAT
            ? getFloat16(view, offset)
            : view.getUint16(offset);
          break;

        case AI_FOUR_BYTES: // 26
          payloadLength = 4;
          value = mt === MT_SIMPLE_FLOAT
            ? view.getFloat32(offset)
            : view.getUint32(offset);
          break;

        case AI_EIGHT_BYTES: // 27
          payloadLength = 8;

          if (mt === MT_SIMPLE_FLOAT) {
            value = view.getFloat64(offset);
          } else {
            value = view.getBigUint64(offset);

            if (mt === MT_NEGATIVE_INTEGER) {
              // 負の値は -1 から value を引いた数なので、最大値より 1 以上小さくないと
              // Number にはなれない。
              if (value <= JS_MAX_SAFE_UNSIGNED_BIG_INTEGER - 1n) {
                value = Number(value);
              }
            } else if (value <= JS_MAX_SAFE_UNSIGNED_BIG_INTEGER) {
              value = Number(value);
            }
          }

          break;

        // # Long Data Item (ai == 31)
        // +--------------+--------------------------------+--------------------------------------+
        // | Byte count   | 1 byte (CBOR data item header) |              0 ~ ? Bytes             |
        // +--------------+------------+-------------------+--------------------------------------+
        // | Structure    | Major type |  Additional info  |                Payload               |
        // +--------------+------------+-------------------+----------+---------------------------+
        // | Bit count    |   3 Bits   |      5 Bits       |  8 Bits  |            ...            |
        // +--------------+------------+-------------------+----------+-----+---------------------+
        // | Bytes / Text |    2, 3    |        31         | bytes[0] | ... | Break (Non-payload) |
        // +--------------+------------+-------------------+----------+-----+---------------------+
        // | Array / Map  |    4, 5    |        31         | N/A (Subsequent data items / pairs)  |
        // +--------------+------------+-------------------+--------------------------------------+
        // | Break        |     7      |        31         |                  N/A                 |
        // +--------------+------------+-------------------+--------------------------------------+

        case AI_INDEFINITE_NUM_BYTES: // 31
          switch (mt) {
            case MT_UNSIGNED_INTEGER:
            case MT_NEGATIVE_INTEGER:
            case MT_TAG:
              // https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-4.5
              throw new CborSyntaxError(
                `The data item \`${HUMANIZED_DATA_ITEM[mt]}\` has `
                  + "indefinite-length bytes.",
              );

            case MT_SIMPLE_FLOAT:
              if (
                (this.parent.$ === PARENT_ARR
                  || this.parent.$ === PARENT_OBJ
                  || this.parent.$ === PARENT_MAP)
                && this.parent.len !== Infinity
              ) {
                throw new CborSyntaxError(
                  `The definite-length data item \`${HUMANIZED_DATA_ITEM[mt]}\``
                    + `contains the "break" stop code.`,
                );
              }

              value = BREAK;
              break;

            case MT_BYTE_STRING:
            case MT_UTF8_STRING:
              if (this.parent.$ === PARENT_STR && mt === this.parent.mt) {
                // https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-4.3
                throw new CborSyntaxError(
                  "The payload of the indefinite-length data item `"
                    + HUMANIZED_DATA_ITEM[mt] + "` contains the same type.",
                );
              }

              value = Infinity;
              break;

            // case MT_ARRAY:
            // case MT_MAP:
            default:
              value = Infinity;
          }

          break;

        // # Invalid Data Item (28 <= ai <= 30)
        // +--------------+--------------------------------+
        // | Byte count   | 1 byte (CBOR data item header) |
        // +--------------+------------+-------------------+
        // | Structure    | Major type |  Additional info  |
        // +--------------+------------+-------------------+
        // | Bit count    |   3 Bits   |      5 Bits       |
        // +--------------+------------+-------------------+
        // | N/A          |   0 ~ 7    |      28 ~ 30      |
        // +--------------+------------+-------------------+

        case 28:
        case 29:
        case 30:
          // https://www.rfc-editor.org/rfc/rfc8949.html#section-3-3.6
          throw new CborSyntaxError(
            `The additional info ${ai} is reserved for future additions to the `
              + "CBOR format.",
          );

        // # Tiny Data Item (0 <= ai <= 23)
        // +--------------+--------------------------------+-------------------------------------+
        // | Byte count   | 1 byte (CBOR data item header) |             0 ~ 23 Bytes            |
        // +--------------+------------+-------------------+-------------------------------------+
        // | Structure    | Major type |  Additional info  |               Payload               |
        // +--------------+------------+-------------------+----------+--------------------------+
        // | Bit count    |   3 Bits   |      5 Bits       |  8 Bits  |           ...            |
        // +--------------+------------+-------------------+----------+--------------------------+
        // | Unsigned Int |     0      |   0 ~ 23 (Value)  |                 N/A                 |
        // +--------------+------------+-------------------+-------------------------------------+
        // | Negative Int |     1      |      0 ~ 23       |                 N/A                 |
        // +--------------+------------+-------------------+----------+---------+----------------+
        // | Bytes / Text |    2, 3    |  count := 0 ~ 23  | bytes[0] |   ...   | bytes[<count>] |
        // +--------------+------------+-------------------+----------+---------+----------------+
        // | Array / Map  |    4, 5    |   0 ~ 23 [items]  | N/A (Subsequent data items / pairs) |
        // +--------------+------------+-------------------+-------------------------------------+
        // | Tag          |     6      |   0 ~ 23 (Value)  |     N/A (A subsequent data item)    |
        // +--------------+------------+-------------------+-------------------------------------+
        // | Simple       |     7      |   0 ~ 19 (Value)  |                 N/A                 |
        // +--------------+------------+-------------------+-------------------------------------+
        // | Boolean      |     7      |      20, 21       |                 N/A                 |
        // +--------------+------------+-------------------+-------------------------------------+
        // | Nullable     |     7      |      22, 23       |                 N/A                 |
        // +--------------+------------+-------------------+-------------------------------------+

        // 0 ~ 23
        default:
          value = ai;
          // if (mt === MT_SIMPLE_FLOAT)
          isSimple = true;
      }

      offset += payloadLength; // ai が 1,2,3,4 バイトを示していなければ 0 加算になる。

      switch (mt) {
        case MT_UNSIGNED_INTEGER: // 0
          break;

        case MT_NEGATIVE_INTEGER: // 1
          // 値は -1 から引数を引いた値
          // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.4
          value = typeof value === "number"
            ? -1 - value
            : -1n - (value as bigint);
          break;

        case MT_BYTE_STRING: // 2
          if (ai === AI_INDEFINITE_NUM_BYTES) {
            this.begin({
              $: PARENT_STR,
              mt,
              put(val) {
                if (val === BREAK) {
                  return true; // done
                }

                if (val instanceof Uint8Array) {
                  this.acc.push(val);
                  this.size += val.length;
                  return false; // continue
                }

                unreachable(val as never);
              },
              out() {
                const data = new Uint8Array(this.size);

                for (
                  let offset = 0, chunk: Uint8Array | undefined;
                  (chunk = this.acc.shift());
                ) {
                  data.set(chunk, offset);
                  offset += chunk.length;
                }

                return data;
              },
              size: 0,
              acc: [],
            });
            continue;
          } else {
            // ここの処理は UTF8 文字列のと全く同じ

            payloadLength = value as number;
            value = input.subarray(offset, offset += payloadLength);

            if (value.length < payloadLength) {
              const data = new Uint8Array(payloadLength);
              data.set(value);
              this.fragment = {
                $: FRAGMENT_STR,
                mt,
                data,
                size: data.length,
                offset: value.length,
              };
              return; // input の最後に到達しているので早期リターン
            }
          }

          break;

        case MT_UTF8_STRING: // 3
          if (ai === AI_INDEFINITE_NUM_BYTES) {
            this.begin({
              $: PARENT_STR,
              mt,
              put(val) {
                if (val === BREAK) {
                  return true; // done
                }

                if (typeof val === "string") {
                  this.acc += val;
                  return false; // continue
                }

                unreachable(val as never);
              },
              out() {
                return this.acc;
              },
              acc: "",
            });
            continue;
          } else {
            // ここの処理はバイト文字列のと全く同じ

            payloadLength = value as number;
            value = input.subarray(offset, offset += payloadLength);

            if (value.length < payloadLength) {
              const data = new Uint8Array(payloadLength);
              data.set(value);
              this.fragment = {
                $: FRAGMENT_STR,
                mt,
                data,
                size: data.length,
                offset: value.length,
              };
              return; // input の最後に到達しているので早期リターン
            }

            // ここだけ違う。デコードはする。
            value = utf8.decode(value);
          }

          break;

        case MT_ARRAY: // 4
          if (ai === AI_INDEFINITE_NUM_BYTES) {
            this.begin({
              $: PARENT_ARR,
              put(val) {
                if (val === BREAK) {
                  return true; // done
                }

                this.acc.push(val);
                return false; // continue
              },
              out() {
                return this.acc;
              },
              len: Infinity,
              idx: NaN,
              acc: [],
            });
            continue;
          } else if (value !== 0) {
            this.begin({
              $: PARENT_ARR,
              put(val) {
                // 固定長配列 に対する BREAK 違反は検証済み。
                this.acc.push(val);
                return ++this.idx === this.len;
              },
              out() {
                return this.acc;
              },
              len: value as number,
              idx: 0,
              acc: [],
            });
            continue;
          } else {
            value = [];
          }

          break;

        case MT_MAP: // 5
          if (this.mapType === "Object") {
            if (ai === AI_INDEFINITE_NUM_BYTES) {
              this.begin({
                $: PARENT_OBJ,
                put(val) {
                  if (val === BREAK) {
                    return true; // done
                  }

                  if (this.key === NONE) {
                    if (
                      (typeof val !== "string" && typeof val !== "number")
                      || !this.v8n(val, this.acc)
                    ) {
                      throw new CborUnsafeMapKeyError(val);
                    }

                    this.key = val;
                  } else {
                    this.acc[this.key] = val;
                    this.key = NONE;
                  }

                  return false; // continue
                },
                out() {
                  if (this.key === NONE) {
                    return this.acc;
                  }

                  throw new CborTooLittleDataError({
                    cause: {
                      key: this.key,
                    },
                  });
                },
                v8n: this.isSafeObjectKey,
                len: Infinity,
                idx: Infinity,
                key: NONE,
                acc: {},
              });
              continue;
            } else if (value !== 0) {
              this.begin({
                $: PARENT_OBJ,
                put(val) {
                  if (this.key === NONE) {
                    if (
                      (typeof val !== "string" && typeof val !== "number")
                      || !this.v8n(val, this.acc)
                    ) {
                      throw new CborUnsafeMapKeyError(val);
                    }

                    this.key = val;
                  } else {
                    // 固定長オブジェクト に対する BREAK 違反は検証済み。
                    this.acc[this.key] = val;
                    this.key = NONE;
                    this.idx += 1;
                  }

                  return this.idx === this.len;
                },
                out() {
                  if (this.key === NONE) {
                    return this.acc;
                  }

                  throw new CborTooLittleDataError({
                    cause: {
                      key: this.key,
                    },
                  });
                },
                v8n: this.isSafeObjectKey,
                len: value as number,
                idx: 0,
                key: NONE,
                acc: {},
              });
              continue;
            } else {
              value = {};
            }
          } else if (this.mapType === "Map") {
            if (ai === AI_INDEFINITE_NUM_BYTES) {
              this.begin({
                $: PARENT_MAP,
                put(val) {
                  if (val === BREAK) {
                    return true; // done
                  }

                  if (this.key === NONE) {
                    if (!this.v8n(val, this.acc)) {
                      throw new CborUnsafeMapKeyError(val);
                    }

                    this.key = val;
                  } else {
                    this.acc.set(this.key, val);
                    this.key = NONE;
                  }

                  return false; // continue
                },
                out() {
                  if (this.key === NONE) {
                    return this.acc;
                  }

                  throw new CborTooLittleDataError({
                    cause: {
                      key: this.key,
                    },
                  });
                },
                v8n: this.isSafeMapKey,
                len: Infinity,
                idx: Infinity,
                key: NONE,
                acc: new Map(),
              });
              continue;
            } else if (value !== 0) {
              this.begin({
                $: PARENT_MAP,
                put(val) {
                  if (this.key === NONE) {
                    if (!this.v8n(val, this.acc)) {
                      throw new CborUnsafeMapKeyError(val);
                    }

                    // 固定長マップ に対する BREAK 違反は検証済み。
                    this.key = val;
                  } else {
                    // 固定長マップ に対する BREAK 違反は検証済み。
                    this.acc.set(this.key, val);
                    this.key = NONE;
                    this.idx += 1;
                  }

                  return this.idx === this.len;
                },
                out() {
                  if (this.key === NONE) {
                    return this.acc;
                  }

                  throw new CborTooLittleDataError({
                    cause: {
                      key: this.key,
                    },
                  });
                },
                v8n: this.isSafeMapKey,
                len: value as number,
                idx: 0,
                key: NONE,
                acc: new Map(),
              });
              continue;
            } else {
              value = new Map();
            }
          } else {
            // 将来的にはカスタムオブジェクトを指定できるようにしたい。
            throw new SurrealValueError(
              ["\"Object\"", "\"Object\""],
              this.mapType,
            );
          }

          break;

        case MT_TAG:
          this.begin({
            $: PARENT_TAG,
            put(val) {
              // タグ付きデータアイテム に対する BREAK 違反は検証済み。
              this.val = val;
              return true; // done
            },
            out() {
              return reviveValue(this.fns, new Tagged(this.tag, this.val));
            },
            fns: this.revivers.tagged,
            tag: value as number | bigint,
            val: undefined,
          });
          continue;

        case MT_SIMPLE_FLOAT:
          // isSimple が true になるのは ai が 0~24 のときだけ。
          if (isSimple) {
            switch (value) {
              case AI_SIMPLE_FALSE: // 20
                value = false;
                break;

              case AI_SIMPLE_TRUE: // 21
                value = true;
                break;

              case AI_SIMPLE_NULL: // 22
                value = null;
                break;

              case AI_SIMPLE_UNDEFINED: // 23
                value = undefined;
                break;

              default:
                // isSimple が true になるときは、少なくとも float ではないので、ここで
                // value を Simple オブジェクトにしても問題ない。
                value = reviveValue(
                  this.revivers.simple,
                  new Simple(value as number),
                );
            }
          }

          break;

        default:
          unreachable(mt);
      }

      if (
        this.parent.$ === PARENT_STR
        && mt !== this.parent.mt
        && value !== BREAK
      ) {
        // https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-4.3
        throw new CborSyntaxError(
          "The payload of the data item `"
            + HUMANIZED_DATA_ITEM[this.parent.mt] + "` contains a mismatched "
            + `data item \`${HUMANIZED_DATA_ITEM[mt]}\`.`,
        );
      }

      this.putValue(value);
    }
  }

  output(): unknown {
    if (this.parent.$ !== PARENT_ROOT || this.fragment) {
      throw new CborTooLittleDataError({
        cause: {
          parents: this.parents,
          fragment: this.fragment,
        },
      });
    }

    // TODO(tai-kun): クリーンアップ必要？一度出力して使いまわす機会ないと思う。
    return this.parent.out();
  }
}

function reviveValue<T>(
  revivers: readonly ((value: T) => unknown)[],
  value: T,
): unknown {
  for (let i = 0, len = revivers.length, ret; i < len; i++) {
    if ((ret = revivers[i]!(value)) !== CONTINUE) {
      return ret;
    }
  }

  return value;
}

function toRevivers(reviver: DecoderOptions["reviver"]): {
  tagged: TaggedItemReviver[];
  simple: SimpleItemReviver[];
} {
  if (!reviver) {
    return {
      tagged: [],
      simple: [],
    };
  }

  if (typeof reviver === "function") {
    return {
      tagged: [reviver],
      simple: [reviver],
    };
  }

  if (Array.isArray(reviver)) {
    const tagged: TaggedItemReviver[] = [];
    const simple: SimpleItemReviver[] = [];

    for (const r of reviver) {
      if (typeof r === "function") {
        tagged.push(r);
        simple.push(r);
      } else {
        r.tagged && tagged.push(r.tagged);
        r.simple && simple.push(r.simple);
      }
    }

    return {
      tagged,
      simple,
    };
  }

  return {
    tagged: reviver.tagged ? [reviver.tagged] : [],
    simple: reviver.simple ? [reviver.simple] : [],
  };
}

function compatReviver(t: Tagged) {
  // https://github.com/surrealdb/surrealdb/blob/v2.0.1/core/src/rpc/format/cbor/convert.rs#L30
  // https://github.com/surrealdb/surrealdb/blob/v2.0.1/core/src/rpc/format/cbor/convert.rs#L324
  // より、NONE のタグは 6 で、その値は null
  if (t.tag === 6 && t.value === null) {
    return; // undefined
  }

  return CONTINUE;
}
