import { quoteStr } from "@tai-kun/surreal/utils";
import type { Encodable } from "../../_shared/types";
import { byteToHex } from "../../_shared/Uuid";
import Base from "../../decode-only/src/Uuid";

/**
 * バイト配列から UUID 文字列に変換します。
 *
 * @param bytes バイト配列。
 * @returns UUID 文字列。
 */
function unsafe_toString36(bytes: Uint8Array): string {
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

export default class Uuid extends Base implements Encodable {
  /**
   * @example
   * ```ts
   * const uuid = new Uuid("8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
   * uuid.toString();
   * // 8f3c721e-439a-4fc0-963c-8dbedf5cc7ee
   * ```
   */
  override toString(): string {
    return unsafe_toString36(this.bytes);
  }

  /**
   * @example
   * ```ts
   * const uuid = new Uuid("8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
   * uuid.toJSON();
   * // 8f3c721e-439a-4fc0-963c-8dbedf5cc7ee
   * ```
   */
  toJSON(): string {
    return unsafe_toString36(this.bytes);
  }

  /**
   * @example
   * ```ts
   * const uuid = new Uuid("8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
   * uuid.toSurql();
   * // 8f3c721e-439a-4fc0-963c-8dbedf5cc7ee
   * ```
   */
  toSurql(): string {
    return "u" + quoteStr(unsafe_toString36(this.bytes));
  }

  structure(): {
    bytes: Uint8Array;
  } {
    return {
      bytes: this.bytes,
    };
  }
}
