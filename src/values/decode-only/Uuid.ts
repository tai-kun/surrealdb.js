import { SurrealTypeError } from "~/errors";
import { _defineAssertUuid } from "../_lib/internal";
import { isValidBytes } from "../_lib/uuid";

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
 * UUID 形式の文字列をバイト配列に変換します。
 *
 * @param uuid UUID 形式の文字列。
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

    throw new SurrealTypeError(`Invalid UUID: ${uuid}`);
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
 * UUID を表すクラス。
 */
export default class Uuid {
  protected _bytes: Uint8Array;

  /**
   * @param uuid UUID を表すバイト配列または文字列。
   */
  constructor(uuid: Uint8Array | string) {
    _defineAssertUuid(this);

    if (typeof uuid === "string") {
      this._bytes = parseUuid36(uuid);
    } else if (uuid instanceof Uint8Array) {
      if (!isValidBytes(uuid)) {
        throw new SurrealTypeError(`Invalid UUID: [${Array.from(uuid)}]`);
      }

      this._bytes = uuid.slice(); // Copy
    } else {
      throw new SurrealTypeError(
        "Expected string or Uint8Array, but got: " + typeof uuid,
      );
    }
  }

  get bytes() {
    return this._bytes.slice();
  }
}
