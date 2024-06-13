import { TypeError } from "../../errors";
import { SurqlValueAbc } from "../../value";
import { _defineAssertUuid } from "../internal";

const UUID_36_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * 16 進数からバイトへの変換テーブル。
 *
 * ```ts
 * [
 *   [
 *     0x00, // hexToBytes[0][0]
 *     0x01, // hexToBytes[0][1]
 *     ...
 *   ],
 *   ...
 *   [
 *     ...
 *     0xfe, // hexToBytes[15][14]
 *     0xff, // hexToBytes[15][15]
 *   ],
 * ]
 * ```
 */
const hexToBytes = /* @__PURE__ */ Array.from(
  { length: 16 },
  (_, i) => Array.from({ length: 16 }, (_, j) => i * 16 + j),
);

/**
 * バイトから 16 進数への変換テーブル。
 *
 * ```ts
 * [
 *   "00", // byteToHex[0]
 *   "01", // byteToHex[1]
 *   ...
 *   "fe", // byteToHex[254]
 *   "ff", // byteToHex[255]
 * ]
 * ```
 *
 * @internal
 */
export const byteToHex = /* @__PURE__ */ Array.from(
  { length: 256 },
  (_, i) => (i + 0x100).toString(16).slice(1),
);

/**
 * バイト配列が有効な UUID かどうかを判定します。
 *
 * @param bytes - バイト配列。
 * @returns 有効な UUID なら `true`、そうでなければ `false`。
 */
function isValidBytes(bytes: Uint8Array): boolean {
  let v;

  return bytes.length === 16 && (
    (
      // regex: [1-7]
      ((v = bytes[6]! >> 4) === 1 || v === 2 || v === 3 || v === 4 || v === 5
        || v === 6 || v === 7)
      // regex: [89ab]
      && ((v = bytes[8]! >> 4) === 8 || v === 9 || v === 10 || v === 11)
    )
    || bytes.every(b => b === 0x00)
    || bytes.every(b => b === 0xff)
  );
}

/**
 * UUID 形式の文字列をバイト配列に変換します。
 *
 * @param uuid - UUID 形式の文字列。
 * @returns バイト配列。
 */
function parseUuid36(uuid: string): Uint8Array {
  if (!UUID_36_REGEX.test(uuid)) {
    if (uuid === "00000000-0000-0000-0000-000000000000") {
      return new Uint8Array(16);
    }

    if (uuid === "ffffffff-ffff-ffff-ffff-ffffffffffff") {
      return new Uint8Array(16).fill(0xff);
    }

    throw new TypeError(`Invalid UUID: ${uuid}`);
  }

  const bytes = new Uint8Array(16);

  for (let a, b, i = 0, j = 0; i < 36; i++) {
    if ((a = uuid.charCodeAt(i)) !== 45 /* "-" */) {
      b = uuid.charCodeAt(++i);
      a = a < 58 ? (a - 48) : (a < 71 ? (a - 55) : (a - 87));
      b = b < 58 ? (b - 48) : (b < 71 ? (b - 55) : (b - 87));
      bytes[j++] = hexToBytes[a]![b]!;
    }
  }

  return bytes;
}

/**
 * バイト配列から UUID 文字列に変換します。
 *
 * @param bytes - バイト配列。
 * @returns UUID 文字列。
 */
function toString36(bytes: Uint8Array): string {
  // dprint-ignore
  return (
    byteToHex[bytes[0]!]! +
    byteToHex[bytes[1]!]! +
    byteToHex[bytes[2]!]! +
    byteToHex[bytes[3]!]! +
    "-" +
    byteToHex[bytes[4]!] +
    byteToHex[bytes[5]!] +
    "-" +
    byteToHex[bytes[6]!] +
    byteToHex[bytes[7]!] +
    "-" +
    byteToHex[bytes[8]!] +
    byteToHex[bytes[9]!] +
    "-" +
    byteToHex[bytes[10]!] +
    byteToHex[bytes[11]!] +
    byteToHex[bytes[12]!] +
    byteToHex[bytes[13]!] +
    byteToHex[bytes[14]!] +
    byteToHex[bytes[15]!]
  );
}

/**
 * UUID を表すクラス。
 */
export default class Uuid extends SurqlValueAbc {
  #bytes: Uint8Array;

  /**
   * @param uuid - UUID を表すバイト配列または文字列。
   */
  constructor(uuid: Uint8Array | string) {
    super();
    _defineAssertUuid(this);

    if (typeof uuid === "string") {
      this.#bytes = parseUuid36(uuid);
    } else if (uuid instanceof Uint8Array) {
      if (!isValidBytes(uuid)) {
        throw new TypeError(`Invalid UUID: [${Array.from(uuid)}]`);
      }

      this.#bytes = uuid.slice(); // Copy
    } else {
      throw new TypeError(
        "Expected string or Uint8Array, but got: " + typeof uuid,
      );
    }
  }

  /**
   * UUID を表すバイト配列。値は参照ではなくコピーです。
   */
  get bytes(): Uint8Array {
    return this.#bytes.slice(); // Copy
  }

  override toString(): string {
    return toString36(this.#bytes);
  }

  toJSON(): string {
    return toString36(this.#bytes);
  }

  toSurql(): string {
    return "u\"" + toString36(this.#bytes) + "\"";
  }
}
