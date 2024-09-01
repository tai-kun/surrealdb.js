import { Uuid as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { quoteStr } from "@tai-kun/surrealdb/utils";
import { CBOR_TAG_SPEC_UUID, type Encodable } from "./spec";

export type * from "../../decode-only/src/uuid";

/**
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
  override valueOf(): string {
    return unsafe_toString36(this.bytes);
  }

  override toString(): string {
    return unsafe_toString36(this.bytes);
  }

  toCBOR(): [tag: typeof CBOR_TAG_SPEC_UUID, value: Uint8Array] {
    return [CBOR_TAG_SPEC_UUID, this.bytes];
  }

  toJSON(): string {
    return unsafe_toString36(this.bytes);
  }

  toSurql(): string {
    return "u" + quoteStr(unsafe_toString36(this.bytes));
  }

  toPlainObject(): {
    bytes: Uint8Array;
  } {
    return {
      bytes: this.bytes,
    };
  }
}
