export const MT_UNSIGNED_INTEGER = 0 as const;
export const MT_NEGATIVE_INTEGER = 1 as const;
export const MT_BYTE_STRING = 2 as const;
export const MT_UTF8_STRING = 3 as const;
export const MT_ARRAY = 4 as const;
export const MT_MAP = 5 as const;
export const MT_TAG = 6 as const;
export const MT_SIMPLE_FLOAT = 7 as const;

export const AI_SIMPLE_FALSE = 20 as const;
export const AI_SIMPLE_TRUE = 21 as const;
export const AI_SIMPLE_NULL = 22 as const;
export const AI_SIMPLE_UNDEFINED = 23 as const;

export const AI_ONE_BYTE = 24 as const;
export const AI_TWO_BYTES = 25 as const;
export const AI_FOUR_BYTES = 26 as const;
export const AI_EIGHT_BYTES = 27 as const;
export const AI_INDEFINITE_NUM_BYTES = 31 as const;

export const BREAK = Symbol.for("@tai-kun/surrealdb/cbor/break");

export const CBOR_MAX_UNSIGNED_INTEGER = 18446744073709551615n; // 2^64-1
export const CBOR_MIN_NEGATIVE_INTEGER = -18446744073709551616n; // -(2^64)

export const JS_MAX_SAFE_UNSIGNED_INTEGER = 9007199254740991; // 2^53-1
export const JS_MAX_SAFE_UNSIGNED_BIG_INTEGER = 9007199254740991n; // 2^53-1

export const HEADER_FLOAT_HALF = 0xf9; // (MT_SIMPLE_FLOAT << 5) | AI_TWO_BYTES;
// export const HEADER_FLOAT_SINGLE = 0xfa; // (MT_SIMPLE_FLOAT << 5) | AI_FOUR_BYTES;
export const HEADER_FLOAT_DOUBLE = 0xfb; // (MT_SIMPLE_FLOAT << 5) | AI_EIGHT_BYTES;
export const HEADER_FALSE = 0xf4; // (MT_SIMPLE_FLOAT << 5) | AI_SIMPLE_FALSE;
export const HEADER_TRUE = 0xf5; // (MT_SIMPLE_FLOAT << 5) | AI_SIMPLE_TRUE;
export const HEADER_NULL = 0xf6; // (MT_SIMPLE_FLOAT << 5) | AI_SIMPLE_NULL;
export const HEADER_UNDEFINED = 0xf7; // (MT_SIMPLE_FLOAT << 5) | AI_SIMPLE_UNDEFINED;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/simple/)
 */
export class Simple {
  /**
   * 0 ~ 19, 32 ~ 255
   * @see https://www.rfc-editor.org/rfc/rfc8949.html#name-simple-values
   */
  value: number;

  constructor(value: number) {
    this.value = value;
  }
}

/** 3 Bits (0 ~ 7) */
export type MajorType =
  | typeof MT_UNSIGNED_INTEGER
  | typeof MT_NEGATIVE_INTEGER
  | typeof MT_BYTE_STRING
  | typeof MT_UTF8_STRING
  | typeof MT_ARRAY
  | typeof MT_MAP
  | typeof MT_TAG
  | typeof MT_SIMPLE_FLOAT;

// dprint-ignore
export namespace AdditionalInfo {
  // 0 ~ 23
  export type Value = 
    |  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7
    |  8 |  9 | 10 | 11 | 12 | 13 | 14 | 15
    | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23

  // 24 ~ 27
  export type NumBytes =
    | typeof AI_ONE_BYTE
    | typeof AI_TWO_BYTES
    | typeof AI_FOUR_BYTES
    | typeof AI_EIGHT_BYTES

  // 28 ~ 30
  export type ReservedForFuture = 28 | 29 | 30

  // 31
  export type Indefinite = typeof AI_INDEFINITE_NUM_BYTES
}

/** 5 Bits (0 ~ 31) */
// dprint-ignore
export type AdditionalInfo =
  | AdditionalInfo.Value
  | AdditionalInfo.NumBytes
  | AdditionalInfo.ReservedForFuture
  | AdditionalInfo.Indefinite

export type DataItemValue =
  | number
  | bigint
  | string
  | Uint8Array
  | boolean
  | null
  | undefined
  | typeof BREAK
  | Simple;

export namespace DataItem {
  //////////////////////////////////////////////////////////////////////////////
  //
  // Major Type 0 (Unsigned integer)
  //
  // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.2
  //
  //////////////////////////////////////////////////////////////////////////////

  export namespace UnsignedInteger {
    export interface Tiny {
      mt: typeof MT_UNSIGNED_INTEGER;
      ai: AdditionalInfo.Value;
      /** 0 ~ 23 */
      value: number;
      // length: 0;
    }

    export interface OneByte {
      mt: typeof MT_UNSIGNED_INTEGER;
      ai: typeof AI_ONE_BYTE;
      /** 24 ~ 2^8-1 */
      value: number;
      // length: 1;
    }

    export interface TwoBytes {
      mt: typeof MT_UNSIGNED_INTEGER;
      ai: typeof AI_TWO_BYTES;
      /** 2^8 ~ 2^16-1 */
      value: number;
      // length: 2;
    }

    export interface FourBytes {
      mt: typeof MT_UNSIGNED_INTEGER;
      ai: typeof AI_FOUR_BYTES;
      /** 2^16 ~ 2^32-1 */
      value: number;
      // length: 4;
    }

    export interface EightBytes {
      mt: typeof MT_UNSIGNED_INTEGER;
      ai: typeof AI_EIGHT_BYTES;
      /** 2^32 ~ 2^64-1 */
      value: number | bigint;
      // length: 8;
    }
  }

  export type UnsignedInteger =
    | UnsignedInteger.Tiny
    | UnsignedInteger.OneByte
    | UnsignedInteger.TwoBytes
    | UnsignedInteger.FourBytes
    | UnsignedInteger.EightBytes;

  //////////////////////////////////////////////////////////////////////////////
  //
  // Major Type 1 (Negative integer)
  //
  // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.4
  //
  //////////////////////////////////////////////////////////////////////////////

  export namespace NegativeInteger {
    export interface Tiny {
      mt: typeof MT_NEGATIVE_INTEGER;
      ai: AdditionalInfo.Value;
      /** -24 ~ -1 */
      value: number;
      // length: 0;
    }

    export interface OneByte {
      mt: typeof MT_NEGATIVE_INTEGER;
      ai: typeof AI_ONE_BYTE;
      /** -(2^8) ~ -25 */
      value: number;
      // length: 1;
    }

    export interface TwoBytes {
      mt: typeof MT_NEGATIVE_INTEGER;
      ai: typeof AI_TWO_BYTES;
      /** -(2^16) ~ -(2^8+1) */
      value: number;
      // length: 2;
    }

    export interface FourBytes {
      mt: typeof MT_NEGATIVE_INTEGER;
      ai: typeof AI_FOUR_BYTES;
      /** -(2^32) ~ -(2^16+1) */
      value: number;
      // length: 4;
    }

    export interface EightBytes {
      mt: typeof MT_NEGATIVE_INTEGER;
      ai: typeof AI_EIGHT_BYTES;
      /** -(2^64) ~ -(2^32+1) */
      value: number | bigint;
      // length: 8;
    }
  }

  export type NegativeInteger =
    | NegativeInteger.Tiny
    | NegativeInteger.OneByte
    | NegativeInteger.TwoBytes
    | NegativeInteger.FourBytes
    | NegativeInteger.EightBytes;

  //////////////////////////////////////////////////////////////////////////////
  //
  // Major Type 2 (Byte string)
  //
  // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.6
  //
  //////////////////////////////////////////////////////////////////////////////

  export namespace ByteString {
    export interface FixedLength {
      mt: typeof MT_BYTE_STRING;
      ai: AdditionalInfo.Value | AdditionalInfo.NumBytes;
      value: Uint8Array;
      // 配列の最大長は 2^53 - 1 (Number.MAX_SAFE_INTEGER) なので、
      // `length` の型は number 型で問題ない。
      // length: number;
    }

    export interface IndefiniteLength {
      mt: typeof MT_BYTE_STRING;
      ai: AdditionalInfo.Indefinite;
      /** +Infinity */
      value: number;
      // length: number; // Positive Infinity
    }
  }

  export type ByteString =
    | ByteString.FixedLength
    | ByteString.IndefiniteLength;

  //////////////////////////////////////////////////////////////////////////////
  //
  // Major Type 3 (Text string encoded as UTF-8)
  //
  // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.8
  //
  //////////////////////////////////////////////////////////////////////////////

  export namespace Utf8String {
    export interface FixedLength {
      mt: typeof MT_UTF8_STRING;
      ai: AdditionalInfo.Value | AdditionalInfo.NumBytes;
      value: string;
      // length: number;
    }

    export interface IndefiniteLength {
      mt: typeof MT_UTF8_STRING;
      ai: AdditionalInfo.Indefinite;
      /** +Infinity */
      value: number;
      // length: number; // Positive Infinity
    }
  }

  export type Utf8String =
    | Utf8String.FixedLength
    | Utf8String.IndefiniteLength;

  //////////////////////////////////////////////////////////////////////////////
  //
  // Major Type 4 (Array of data items)
  //
  // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.10
  //
  //////////////////////////////////////////////////////////////////////////////

  export namespace Array {
    export interface FixedLength {
      mt: typeof MT_ARRAY;
      ai: AdditionalInfo.Value | AdditionalInfo.NumBytes;
      // 配列の最大長は 2^53 - 1 (Number.MAX_SAFE_INTEGER) なので、
      // `value` の型は number 型で問題ない。
      /** 0 ~ 2^53 - 1 */
      value: number;
      // length: number;
    }

    export interface IndefiniteLength {
      mt: typeof MT_ARRAY;
      ai: AdditionalInfo.Indefinite;
      /** +Infinity */
      value: number;
      // length: number; // Positive Infinity
    }
  }

  export type Array =
    | Array.FixedLength
    | Array.IndefiniteLength;

  //////////////////////////////////////////////////////////////////////////////
  //
  // Major Type 5 (Map of pairs of data items)
  //
  // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.12
  //
  //////////////////////////////////////////////////////////////////////////////

  export namespace Map {
    export interface FixedLength {
      mt: typeof MT_MAP;
      ai: AdditionalInfo.Value | AdditionalInfo.NumBytes;
      // オブジェクトのプロパティ数の上限値を調べてみると
      //   V8:       8_430_000
      //   Firefox: 16_870_000
      // だったので、`value` の型は number 型で問題ないと思われる。
      // https://stackoverflow.com/questions/9282869/are-there-limits-to-the-number-of-properties-in-a-javascript-object
      /** 0 ~ Finite positive integer */
      value: number;
      // length: number;
    }

    export interface IndefiniteLength {
      mt: typeof MT_MAP;
      ai: AdditionalInfo.Indefinite;
      /** +Infinity */
      value: number;
      // length: number; // Positive Infinity
    }
  }

  export type Map =
    | Map.FixedLength
    | Map.IndefiniteLength;

  //////////////////////////////////////////////////////////////////////////////
  //
  // Major Type 6 (Tagged data item)
  //
  // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.14
  //
  //////////////////////////////////////////////////////////////////////////////

  export interface Tag {
    mt: typeof MT_TAG;
    ai: AdditionalInfo.Value | AdditionalInfo.NumBytes;
    value: number | bigint;
    // length: 0 | 1 | 2 | 4 | 8;
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  // Major Type 7 (Floating-point numbers and simple values, as wel as the
  //               "break" stop code)
  //
  // https://www.rfc-editor.org/rfc/rfc8949.html#section-3.1-2.16
  //
  //////////////////////////////////////////////////////////////////////////////

  export namespace SimpleFloat {
    export namespace Unassigned {
      export interface Tiny {
        mt: typeof MT_SIMPLE_FLOAT;
        ai: Exclude<
          AdditionalInfo.Value,
          (False | True | Null | Undefined)["ai"]
        >; // 0 ~ 19
        /**
         * 0 ~ 19
         * @see https://www.rfc-editor.org/rfc/rfc8949.html#name-simple-values
         */
        value: Simple;
        // length: 0;
      }

      // value: 20      ... false
      // value: 21      ... true
      // value: 22      ... null
      // value: 23      ... undefined
      // value: 24 ~ 31 ... (reserved)

      export interface Short {
        mt: typeof MT_SIMPLE_FLOAT;
        ai: typeof AI_ONE_BYTE; // 24
        /**
         * 32 ~ 255
         * @see https://www.rfc-editor.org/rfc/rfc8949.html#name-simple-values
         */
        value: Simple;
        // length: 1;
      }
    }

    // ai: 0 ~ 19, 24
    export type Unassigned =
      | Unassigned.Tiny
      | Unassigned.Short;

    // ai: 20
    export interface False {
      mt: typeof MT_SIMPLE_FLOAT;
      ai: typeof AI_SIMPLE_FALSE;
      value: false; // Converted from 20
      // length: 0;
    }

    // ai: 21
    export interface True {
      mt: typeof MT_SIMPLE_FLOAT;
      ai: typeof AI_SIMPLE_TRUE;
      value: true; // Converted from 21
      // length: 0;
    }

    // ai: 22
    export interface Null {
      mt: typeof MT_SIMPLE_FLOAT;
      ai: typeof AI_SIMPLE_NULL;
      value: null; // Converted from 22
      // length: 0;
    }

    // ai: 23
    export interface Undefined {
      mt: typeof MT_SIMPLE_FLOAT;
      ai: typeof AI_SIMPLE_UNDEFINED;
      value: undefined; // Converted from 23
      // length: 0;
    }

    // ai: 24
    // Unassigned.Short

    export namespace Float {
      export interface Half {
        mt: typeof MT_SIMPLE_FLOAT;
        ai: typeof AI_TWO_BYTES; // 25
        value: number;
        // length: 2;
      }

      export interface Single {
        mt: typeof MT_SIMPLE_FLOAT;
        ai: typeof AI_FOUR_BYTES; // 26
        value: number;
        // length: 4;
      }

      export interface Double {
        mt: typeof MT_SIMPLE_FLOAT;
        ai: typeof AI_EIGHT_BYTES; // 27
        value: number;
        // length: 8;
      }
    }

    // ai: 25 ~ 27
    export type Float =
      | Float.Half
      | Float.Single
      | Float.Double;

    // ai: 28 ~ 30
    // AdditionalInfo.ReservedForFuture

    // ai: 31
    export interface Break {
      mt: typeof MT_SIMPLE_FLOAT;
      ai: typeof AI_INDEFINITE_NUM_BYTES; // 31
      value: typeof BREAK;
      // length: 0;
    }
  }

  export type SimpleFloat =
    | SimpleFloat.Unassigned
    | SimpleFloat.False
    | SimpleFloat.True
    | SimpleFloat.Null
    | SimpleFloat.Undefined
    | SimpleFloat.Float
    | SimpleFloat.Break;
}

export type DataItem =
  | DataItem.UnsignedInteger
  | DataItem.NegativeInteger
  | DataItem.ByteString
  | DataItem.Utf8String
  | DataItem.Array
  | DataItem.Map
  | DataItem.Tag
  | DataItem.SimpleFloat;
