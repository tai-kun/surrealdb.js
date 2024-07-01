import { unreachable } from "~/errors";
import { quoteStr } from "~/index/escape";
import type { SurqlValueSerializer } from "../../_values/Serializer";
import Base, { byteToHex } from "../../tiny/values/Uuid";

/**
 * UUID のバリアント。
 *
 * @see https://ja.wikipedia.org/w/index.php?title=UUID
 */
export type UuidVariant =
  | "NIL" // 00000000-0000-0000-0000-000000000000
  | "MAX" // ffffffff-ffff-ffff-ffff-ffffffffffff
  | "NCS" // 0xxx (0b0000 ~ 0b0111)
  | "RFC" // 10xx (0b1000 ~ 0b1011)
  | "MS" // 110x (0b1100 ~ 0b1101)
  | "RESERVED"; // 111x (0b1110 ~ 0b1111)

export type UuidVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default class Uuid extends Base implements SurqlValueSerializer {
  #variant: UuidVariant | undefined;
  #version: UuidVersion | null | undefined;
  #timestamp: number | null | undefined;

  /**
   * @example
   * ```ts
   * const uuid = new Uuid("8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
   * uuid.toString();
   * // 8f3c721e-439a-4fc0-963c-8dbedf5cc7ee
   * ```
   */
  toJSON(): string {
    return this.toString();
  }

  /**
   * @example
   * ```ts
   * const uuid = new Uuid("8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
   * uuid.toSurql();
   * // u"8f3c721e-439a-4fc0-963c-8dbedf5cc7ee"
   * ```
   */
  toSurql(): string {
    return "u" + quoteStr(this.toString());
  }

  /**
   * UUID のバリアント。
   */
  get variant(): UuidVariant {
    if (!this.#variant) {
      const bytes = this.bytes;
      const v = bytes[8]! >>> 4;

      switch (true) {
        case v < 0b0000:
          unreachable();

        case v === 0b0000 && bytes.every(b => b === 0x00):
          this.#variant = "NIL";
          break;

        case v <= 0b0111:
          this.#variant = "NCS";
          break;

        case v <= 0b1011:
          this.#variant = "RFC";
          break;

        case v <= 0b1101:
          this.#variant = "MS";
          break;

        case v === 0b1111 && bytes.every(b => b === 0xff):
          this.#variant = "MAX";
          break;

        case v <= 0b1111:
          this.#variant = "RESERVED";
          break;

        default:
          unreachable();
      }
    }

    return this.#variant;
  }

  /**
   * UUID のバージョン。バリアントが RFC でない場合は null です。
   */
  get version(): UuidVersion | null {
    if (this.#version === undefined) {
      this.#version = this.variant === "RFC"
        ? (this.bytes[6]! >>> 4) as UuidVersion
        : null;
    }

    return this.#version;
  }

  /**
   * UUID から取得できる Unix 時間 (ミリ秒)。
   * タイムスタンプを持たないバージョンの UUID の場合は null です。
   */
  get timestamp(): number | null {
    if (this.#timestamp === undefined) {
      this.#timestamp = getUnixMillisecondsFromUuid(this);
    }

    return this.#timestamp;
  }

  /**
   * 他の UUID とのタイムスタンプを比較します。
   * このインスタンスまたは他の UUID がタイムスタンプを持たない場合は 0 を返します。
   *
   * @param other 比較対象の UUID。
   * @returns 比較結果。
   */
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
      : getUnixMillisecondsFromUuid(other);

    if (b === null) {
      return 0;
    }

    return a < b ? -1 : a > b ? 1 : 0;
  }
}

/**
 * UUID から Unix 時間 (ミリ秒)を取得します。
 *
 * @param uuid UUID。
 * @returns Unix 時間 (ミリ秒)。
 */
function getUnixMillisecondsFromUuid(
  uuid: {
    readonly bytes: Uint8Array;
    readonly version: UuidVersion | null;
  },
): number | null {
  switch (uuid.version) {
    case 1:
      return getUnixMillisecondsFromUuidV1(uuid.bytes);

    case 6:
      return getUnixMillisecondsFromUuidV6(uuid.bytes);

    case 7:
      return getUnixMillisecondsFromUuidV7(uuid.bytes);

    default:
      return null;
  }
}

// グレゴリオ暦の開始日時: 1582-10-15T00:00:00.000Z
const GREGORIAN_OFFSET = 122_192_928_000_000_000n;

/**
 * UUID v1 から Unix 時間 (ミリ秒)を取得します。
 *
 * @param bytes UUID v1 のバイト配列。
 * @returns Unix 時間 (ミリ秒)。
 */
function getUnixMillisecondsFromUuidV1(bytes: Uint8Array): number {
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
    // ________-____-1###-____-____________
    + byteToHex[bytes[6]!]![1]
    + byteToHex[bytes[7]!]
    // ________-####-1___-____-____________
    + byteToHex[bytes[4]!]
    + byteToHex[bytes[5]!]
    // ########-____-1___-____-____________
    + byteToHex[bytes[0]!]
    + byteToHex[bytes[1]!]
    + byteToHex[bytes[2]!]
    + byteToHex[bytes[3]!];
  const timestamp = BigInt(hex);
  const fromUnixEpoch = timestamp - GREGORIAN_OFFSET;
  const unixMilliseconds = fromUnixEpoch / 10_000n; // 100ns -> ms

  return Number(unixMilliseconds);
}

/**
 * UUID v6 から Unix 時間 (ミリ秒)を取得します。
 *
 * @param bytes UUID v6 のバイト配列。
 * @returns Unix 時間 (ミリ秒)。
 */
function getUnixMillisecondsFromUuidV6(bytes: Uint8Array): number {
  // https://www.ietf.org/archive/id/draft-peabody-dispatch-new-uuid-format-04.html#name-uuid-version-6
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
    // ########-____-6___-____-____________
    + byteToHex[bytes[0]!]
    + byteToHex[bytes[1]!]
    + byteToHex[bytes[2]!]
    + byteToHex[bytes[3]!]
    // ________-####-6___-____-____________
    + byteToHex[bytes[4]!]
    + byteToHex[bytes[5]!]
    // ________-____-6###-____-____________
    + byteToHex[bytes[6]!]![1]
    + byteToHex[bytes[7]!];
  const timestamp = BigInt(hex);
  const fromUnixEpoch = timestamp - GREGORIAN_OFFSET;
  const unixMilliseconds = fromUnixEpoch / 10_000n; // 100ns -> ms

  return Number(unixMilliseconds);
}

/**
 * UUID v7 から Unix 時間 (ミリ秒)を取得します。
 *
 * @param bytes UUID v7 のバイト配列。
 * @returns Unix 時間 (ミリ秒)。
 */
function getUnixMillisecondsFromUuidV7(bytes: Uint8Array): number {
  // https://www.ietf.org/archive/id/draft-peabody-dispatch-new-uuid-format-04.html#name-uuid-version-7
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
    // ########-____-7___-____-____________
    + byteToHex[bytes[0]!]
    + byteToHex[bytes[1]!]
    + byteToHex[bytes[2]!]
    + byteToHex[bytes[3]!]
    // ________-####-7___-____-____________
    + byteToHex[bytes[4]!]
    + byteToHex[bytes[5]!];
  const unixMilliseconds = parseInt(hex);

  return unixMilliseconds;
}
