import {
  CborMaxDepthReachedError,
  CborSyntaxError,
  CborTooLittleDataError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import { getFloat16 } from "./float";
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
  type DataItem,
  type DataItemValue,
  JS_MAX_SAFE_UNSIGNED_INTEGER,
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

const LOOP_MODE_MAP = 0 as const;
const LOOP_MODE_ARRAY = 1 as const;
const LOOP_MODE_STRING = 2 as const;
const LOOP_MODE_STREAM = 3 as const;

type Loop = {
  mode: typeof LOOP_MODE_MAP;
  /**
   * - `true`: キーをパースする。
   * - `lfase`: 値をパースする。
   */
  prop: boolean;
  index: number;
  length: number;
} | {
  mode: typeof LOOP_MODE_ARRAY;
  index: number;
  length: number;
} | {
  mode: typeof LOOP_MODE_STRING;
  type: typeof MT_BYTE_STRING | typeof MT_UTF8_STRING;
  /**
   * - `true`: 最初のループ処理である。
   * - `false`: 2 回目以降のループ処理である。
   */
  first: boolean;
} | {
  mode: typeof LOOP_MODE_STREAM;
};

export interface LexerOptions {
  readonly maxDepth?: number | undefined;
}

export class Lexer {
  private loop: Loop | undefined;
  private depth = 0;
  private loopParents: Loop[] = [];
  maxDepth: number;

  constructor(options: LexerOptions | undefined = {}) {
    this.maxDepth = options.maxDepth ?? 64;
  }

  private beginLoop(parent: Loop, count = true): void {
    if (count && ++this.depth >= this.maxDepth) {
      throw new CborMaxDepthReachedError(this.maxDepth);
    }

    this.loopParents.push(this.loop = parent);
  }

  private endLoop(): void {
    this.loopParents.pop();
    // loopParents が空の場合、loop には初期値と同じ undefined が設定される。
    this.loop = this.loopParents[this.loopParents.length - 1]!;
    this.depth -= 1;
  }

  private closeLoop(): void {
    while (
      this.loop
      && "index" in this.loop
      // .length の比較は === で行うこと。
      && this.loop.index === this.loop.length
    ) {
      this.endLoop();
    }
  }

  end(): void {
    this.closeLoop();

    if (this.loop) {
      throw new CborTooLittleDataError({
        cause: this.loopParents,
      });
    }
  }

  *stream(bytes: Uint8Array): Generator<DataItem, void, unknown> {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let byteOffset = 0;

    while (byteOffset < view.byteLength) {
      const ib = view.getUint8(byteOffset++);
      let mt = (ib >> 5) as MajorType;
      let ai = (ib & 0x1f) as AdditionalInfo;
      let value: DataItemValue = undefined;
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
          value = view.getUint8(byteOffset);

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
            ? getFloat16(view, byteOffset)
            : view.getUint16(byteOffset);
          break;

        case AI_FOUR_BYTES: // 26
          payloadLength = 4;
          value = mt === MT_SIMPLE_FLOAT
            ? view.getFloat32(byteOffset)
            : view.getUint32(byteOffset);
          break;

        case AI_EIGHT_BYTES: // 27
          payloadLength = 8;

          if (mt === MT_SIMPLE_FLOAT) {
            value = view.getFloat64(byteOffset);
          } else {
            value = view.getBigUint64(byteOffset);

            if (mt === MT_NEGATIVE_INTEGER) {
              // 負の値は -1 から value を引いた数なので、最大値より 1 以上小さくないと
              // Number にはなれない。
              if (value <= JS_MAX_SAFE_UNSIGNED_INTEGER - 1n) {
                value = Number(value);
              }
            } else if (value <= JS_MAX_SAFE_UNSIGNED_INTEGER) {
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
                "Major Type " + mt + " has indefinite-length bytes.",
              );

            case MT_SIMPLE_FLOAT:
              if (!this.loop) {
                // https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-4.4
                throw new CborSyntaxError(
                  `The "break" stop code was encountered outside of`
                    + " a indefinite-length data item.",
                );
              }

              value = BREAK;
              break;

            // MT_BYTE_STRING, MT_UTF8_STRING, MT_ARRAY or MT_MAP
            default:
              value = Infinity;
          }

          // // 後に byteOffset に payloadLength を加算するので、ここでは payloadLength を
          // // Infinity にしない。

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
            "The additional info " + ai
              + " is reserved for future additions to the CBOR format.",
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
          // if (mt === MT_SIMPLE_FLOAT) {
          isSimple = true;
          // }
      }

      byteOffset += payloadLength;

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
        case MT_UTF8_STRING: // 3
          if (ai === AI_INDEFINITE_NUM_BYTES) {
            // payloadLength = Infinity;
            this.beginLoop({
              mode: LOOP_MODE_STRING,
              type: mt,
              first: true,
            }, false);
          } else {
            payloadLength = value as number;
            value = bytes.subarray(byteOffset, byteOffset += payloadLength);

            if (value.length !== payloadLength) {
              throw new CborSyntaxError(
                "Expected a payload length of " + payloadLength + " byte(s),"
                  + " but it was actually " + value.length + " byte(s).",
              );
            }

            if (mt === MT_UTF8_STRING) {
              value = utf8.decode(value);
            }
          }

          break;

        case MT_ARRAY: // 4
          // TODO(tai-kun): 符号なし 32 ビット整数を超える場合は長過ぎるよエラーを投げる？
          // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length
          // RangeError: Invalid array length

          if (ai === AI_INDEFINITE_NUM_BYTES) {
            // payloadLength = Infinity;
            this.beginLoop({
              mode: LOOP_MODE_STREAM,
            });
          } else if (value !== 0) {
            this.beginLoop({
              mode: LOOP_MODE_ARRAY,
              index: 0,
              length: value as number,
            });
          }

          break;

        case MT_MAP: // 5
          if (ai === AI_INDEFINITE_NUM_BYTES) {
            // payloadLength = Infinity;
            this.beginLoop({
              mode: LOOP_MODE_STREAM,
            });
          } else if (value !== 0) {
            this.beginLoop({
              mode: LOOP_MODE_MAP,
              prop: true,
              index: 0,
              length: value as number,
            });
          }

          break;

        case MT_TAG: // 6
          yield { mt, ai, value /* , length: payloadLength */ } as DataItem;
          continue;

        case MT_SIMPLE_FLOAT: // 7
          if (ai === AI_INDEFINITE_NUM_BYTES) {
            // // value は BREAK なので、ペイロードの長さは 0。
            // // したがってここで `payloadLength` を Infinity にはせず、0 のままにする。
          } else if (isSimple) {
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
                // isSimple が true になるときは、少なくとも float ではないので、
                // ここで value を Simple クラスのインスタンスにしても問題ない。
                value = new Simple(value as number);
            }
          }

          break;

        default:
          unreachable(mt);
      }

      yield { mt, ai, value /* , length: payloadLength */ } as DataItem;

      this.closeLoop();

      if (!this.loop) {
        continue;
      }

      switch (this.loop.mode) {
        case LOOP_MODE_MAP:
          if (this.loop.prop) {
            this.loop.prop = false;
          } else {
            this.loop.prop = true;
            this.loop.index += 1;
          }

          break;

        case LOOP_MODE_ARRAY:
          this.loop.index += 1;
          break;

        case LOOP_MODE_STRING:
          switch (true) {
            case value === BREAK:
              this.endLoop();
              break;

            case this.loop.first:
              this.loop.first = false;
              break;

            case mt !== this.loop.type:
              // https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-4.3
              throw new CborSyntaxError(
                "The payload of major type " + this.loop.type
                  + " contains a major type " + mt + ".",
              );

            case ai === AI_INDEFINITE_NUM_BYTES:
              // https://www.rfc-editor.org/rfc/rfc8949.html#section-appendix.f-4.3
              throw new CborSyntaxError(
                "The payload of major type " + this.loop.type
                  + " contains additional information"
                  + " indicating a indefinite-length.",
              );
          }

          break;

        case LOOP_MODE_STREAM:
          if (value === BREAK) {
            this.endLoop();
          }

          break;

        default:
          unreachable(this.loop);
      }
    }
  }
}
