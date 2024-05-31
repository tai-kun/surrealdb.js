import { _defineAssertUuid } from "../utils";

// SurrealDB uses UUID v4 and v7.
const UUID_36_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * A lookup table for converting hex to bytes.
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
 * A lookup table for converting bytes to hex.
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
 */
const byteToHex = /* @__PURE__ */ Array.from(
  { length: 256 },
  (_, i) => (i + 0x100).toString(16).slice(1),
);

/**
 * Checks if a byte array is a valid UUID.
 *
 * @param bytes - The UUID byte array.
 * @returns `true` if the byte array is a valid UUID, otherwise `false`.
 */
function isValidBytes(bytes: Uint8Array): boolean {
  let v;

  return bytes.length === 16
    // regex: [47]
    && ((v = bytes[6]! >> 4) === 4 || v === 7)
    // regex: [89ab]
    && ((v = bytes[8]! >> 4) === 8 || v === 9 || v === 10 || v === 11);
}

/**
 * Parses a UUID string to a byte array.
 *
 * @param uuid - The UUID string.
 * @returns The UUID byte array.
 */
function parseUuid36(uuid: string): Uint8Array {
  if (!UUID_36_REGEX.test(uuid)) {
    throw new Error(`Invalid UUID: ${uuid}`);
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
 * Converts a UUID byte array to a string representation.
 *
 * @param bytes - The UUID byte array.
 * @returns The UUID string.
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
 * A class representing a UUID.
 */
export class Uuid {
  #bytes: Uint8Array;

  /**
   * @param uuid - The UUID byte array or string.
   */
  constructor(uuid: Uint8Array | string) {
    _defineAssertUuid(this);

    if (typeof uuid === "string") {
      this.#bytes = parseUuid36(uuid);
    } else if (isValidBytes(uuid)) {
      this.#bytes = uuid.slice(); // Copy
    } else {
      throw new Error(`Invalid UUID: ${uuid}`);
    }
  }

  /**
   * The UUID byte array.
   */
  get bytes(): Uint8Array {
    return this.#bytes.slice(); // Copy
  }

  /**
   * The UUID version.
   */
  get version(): 4 | 7 {
    return (this.#bytes[6]! >> 4) as 4 | 7;
  }

  /**
   * Returns the string representation of the UUID.
   */
  toString(): string {
    return toString36(this.#bytes);
  }

  /**
   * Returns the JSON representation of the UUID.
   * This is the same as `toString`.
   */
  toJSON(): string {
    return this.toString();
  }
}
