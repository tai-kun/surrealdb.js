import {
  Uuid as Base,
  type UuidSource,
} from "@tai-kun/surrealdb/data-types/encodable";
import { SurrealValueError, unreachable } from "@tai-kun/surrealdb/errors";
import { isValidBytes } from "~/data-types/_internals/uuid";

export type * from "~/data-types/encodable/src/uuid";

// const UUID_36_REGEX =
//   /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

export type UuidVariant =
  | "NIL" // 00000000-0000-0000-0000-000000000000
  | "MAX" // ffffffff-ffff-ffff-ffff-ffffffffffff
  | "NCS" // 0xxx (0b0000 ~ 0b0111)
  | "RFC" // 10xx (0b1000 ~ 0b1011)
  | "MS" // 110x (0b1100 ~ 0b1101)
  | "RESERVED"; // 111x (0b1110 ~ 0b1111)

export type UuidVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * ```ts
 * [
 *   "00", // BYTE_TO_HEX[0]
 *   "01", // BYTE_TO_HEX[1]
 *   ...
 *   "fe", // BYTE_TO_HEX[254]
 *   "ff", // BYTE_TO_HEX[255]
 * ]
 * ```
 */
const BYTE_TO_HEX = /* @__PURE__ */ Array.from(
  { length: 256 },
  (_, i) => (i + 0x100).toString(16).slice(1),
);

/**
 * ```ts
 * [
 *   [
 *     0x00, // HEX_TO_BYTES[0][0]
 *     0x01, // HEX_TO_BYTES[0][1]
 *     ...
 *   ],
 *   ...
 *   [
 *     ...
 *     0xfe, // HEX_TO_BYTES[15][14]
 *     0xff, // HEX_TO_BYTES[15][15]
 *   ],
 * ]
 * ```
 */
const HEX_TO_BYTES = /* @__PURE__ */ Array.from(
  { length: 16 },
  (_, i) => Array.from({ length: 16 }, (_, j) => i * 16 + j),
);

function parseUuid36(uuid: string): Uint8Array {
  // if (uuid === "00000000-0000-0000-0000-000000000000") {
  //   return new Uint8Array(16);
  // }

  // if (uuid === "ffffffff-ffff-ffff-ffff-ffffffffffff") {
  //   return new Uint8Array(16).fill(0xff);
  // }

  if (uuid.length !== 36) {
    throw new SurrealValueError("a valid uuid", uuid);
  }

  const bytes = new Uint8Array(16);

  for (let a, b, i = 0, j = 0; i < 36; i++) {
    if ((a = uuid.charCodeAt(i)) !== 45 /* "-" */) {
      b = uuid.charCodeAt(++i);
      a = a < 58 ? (a - 48) : (a < 71 ? (a - 55) : (a - 87));
      b = b < 58 ? (b - 48) : (b < 71 ? (b - 55) : (b - 87));
      bytes[j++] = HEX_TO_BYTES[a]![b]!;
    }
  }

  return bytes;
}

export default class Uuid extends Base {
  protected _variant: UuidVariant | undefined;
  protected _version: UuidVersion | null | undefined;
  protected _timestamp: number | null | undefined;

  override get bytes(): Uint8Array {
    return this._bytes;
  }

  override set bytes(v: Uint8Array) {
    if (!isValidBytes(v)) {
      throw new SurrealValueError("a valid uuid", v);
    }

    this._bytes = v;
    // Clear cache
    this._variant = undefined;
    this._version = undefined;
    this._timestamp = undefined;
  }

  constructor(value: UuidSource | string) {
    super(typeof value === "string" ? parseUuid36(value) : value);
  }

  get variant(): UuidVariant {
    if (this._variant === undefined) {
      const bytes = this.bytes;
      const v = bytes[8]! >>> 4;

      switch (true) {
        case v < 0b0000:
          unreachable();

        case v === 0b0000 && bytes.every(b => b === 0x00):
          this._variant = "NIL";
          break;

        case v <= 0b0111:
          this._variant = "NCS";
          break;

        case v <= 0b1011:
          this._variant = "RFC";
          break;

        case v <= 0b1101:
          this._variant = "MS";
          break;

        case v === 0b1111 && bytes.every(b => b === 0xff):
          this._variant = "MAX";
          break;

        case v <= 0b1111:
          this._variant = "RESERVED";
          break;

        default:
          unreachable();
      }
    }

    return this._variant;
  }

  get version(): UuidVersion | null {
    if (this._version === undefined) {
      this._version = this.variant === "RFC"
        ? (this.bytes[6]! >>> 4) as UuidVersion
        : null;
    }

    return this._version;
  }

  get timestamp(): number | null {
    if (this._timestamp === undefined) {
      this._timestamp = unsafe_getUnixMillisecondsFromUuid(this);
    }

    return this._timestamp;
  }

  clone(): this {
    const This = this.constructor as typeof Uuid;

    return new This(this.bytes.slice()) as this;
  }

  // TODO(tai-kun): 時間でイコール判定? bytes でイコール判定?
  // equals(other): boolean {}

  compareTo(
    other: {
      readonly bytes: Uint8Array;
      readonly version: UuidVersion | null;
      readonly timestamp?: number | null;
    },
  ): -1 | 0 | 1 {
    let a = this.timestamp, b: number | null;

    if (a === null) {
      return 0;
    }

    b = "timestamp" in other
      ? other.timestamp
      : unsafe_getUnixMillisecondsFromUuid(other);

    if (b === null) {
      return 0;
    }

    return a < b ? -1 : a > b ? 1 : 0;
  }
}

function unsafe_getUnixMillisecondsFromUuid(
  uuid: {
    readonly bytes: Uint8Array;
    readonly version: UuidVersion | null;
  },
): number | null {
  switch (uuid.version) {
    case 1:
      return unsafe_getUnixMillisecondsFromUuidV1(uuid.bytes);

    case 6:
      return unsafe_getUnixMillisecondsFromUuidV6(uuid.bytes);

    case 7:
      return unsafe_getUnixMillisecondsFromUuidV7(uuid.bytes);

    default:
      return null;
  }
}

// グレゴリオ暦の開始日時: 1582-10-15T00:00:00.000Z
const GREGORIAN_OFFSET = 122_192_928_000_000_000n;

function unsafe_getUnixMillisecondsFromUuidV1(bytes: Uint8Array): number {
  //  0                   1                   2                   3
  //  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |                          time_low                             |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |           time_mid            |     time_high_and_version     |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |clk_seq_hi_res |  clk_seq_low  |         node (0-1)            |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |                         node (2-5)                            |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  const hex = "0x"
    // ________-____-1XXX-____-____________
    + BYTE_TO_HEX[bytes[6]!]![1]
    + BYTE_TO_HEX[bytes[7]!]
    // ________-XXXX-1___-____-____________
    + BYTE_TO_HEX[bytes[4]!]
    + BYTE_TO_HEX[bytes[5]!]
    // XXXXXXXX-____-1___-____-____________
    + BYTE_TO_HEX[bytes[0]!]
    + BYTE_TO_HEX[bytes[1]!]
    + BYTE_TO_HEX[bytes[2]!]
    + BYTE_TO_HEX[bytes[3]!];
  const timestamp = BigInt(hex);
  const fromUnixEpoch = timestamp - GREGORIAN_OFFSET;
  const unixMilliseconds = fromUnixEpoch / 10_000n; // 100ns -> ms

  return Number(unixMilliseconds);
}

function unsafe_getUnixMillisecondsFromUuidV6(bytes: Uint8Array): number {
  // https://www.ietf.org/archive/id/draft-peabody-dispatch-new-uuid-format-04.html_name-uuid-version-6
  //  0                   1                   2                   3
  //  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |                           time_high                           |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |           time_mid            |      time_low_and_version     |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |clk_seq_hi_res |  clk_seq_low  |         node (0-1)            |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |                         node (2-5)                            |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  const hex = "0x"
    // XXXXXXXX-____-6___-____-____________
    + BYTE_TO_HEX[bytes[0]!]
    + BYTE_TO_HEX[bytes[1]!]
    + BYTE_TO_HEX[bytes[2]!]
    + BYTE_TO_HEX[bytes[3]!]
    // ________-XXXX-6___-____-____________
    + BYTE_TO_HEX[bytes[4]!]
    + BYTE_TO_HEX[bytes[5]!]
    // ________-____-6XXX-____-____________
    + BYTE_TO_HEX[bytes[6]!]![1]
    + BYTE_TO_HEX[bytes[7]!];
  const timestamp = BigInt(hex);
  const fromUnixEpoch = timestamp - GREGORIAN_OFFSET;
  const unixMilliseconds = fromUnixEpoch / 10_000n; // 100ns -> ms

  return Number(unixMilliseconds);
}

function unsafe_getUnixMillisecondsFromUuidV7(bytes: Uint8Array): number {
  // https://www.ietf.org/archive/id/draft-peabody-dispatch-new-uuid-format-04.html_name-uuid-version-7
  //  0                   1                   2                   3
  //  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |                           unix_ts_ms                          |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |          unix_ts_ms           |  ver  |       rand_a          |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |var|                        rand_b                             |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // |                            rand_b                             |
  // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  const hex = "0x"
    // XXXXXXXX-____-7___-____-____________
    + BYTE_TO_HEX[bytes[0]!]
    + BYTE_TO_HEX[bytes[1]!]
    + BYTE_TO_HEX[bytes[2]!]
    + BYTE_TO_HEX[bytes[3]!]
    // ________-XXXX-7___-____-____________
    + BYTE_TO_HEX[bytes[4]!]
    + BYTE_TO_HEX[bytes[5]!];
  const unixMilliseconds = parseInt(hex);

  return unixMilliseconds;
}
