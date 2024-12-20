import { Decimal as Base } from "@tai-kun/surrealdb/decodeonly-datatypes";
import { CBOR_TAG_DECIMAL, type Encodable } from "./spec";

export type * from "../decode-only/decimal";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/decimal)
 */
export default class Decimal extends Base implements Encodable {
  [Symbol.toPrimitive](hint: "default" | "string"): string;
  [Symbol.toPrimitive](hint: "number"): number;
  [Symbol.toPrimitive](hint: string): string | number;
  [Symbol.toPrimitive](hint: string): string | number {
    switch (hint) {
      case "number":
        return Number(this._value);

      case "string":
      case "default":
        return this._value;

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_DECIMAL,
    value: string,
  ] {
    return [
      CBOR_TAG_DECIMAL,
      this._value,
    ];
  }

  toJSON(): string {
    return this._value;
  }

  toSurql(): string {
    return this._value + "dec";
  }

  toPlainObject(): {
    value: string;
  } {
    return {
      value: this._value,
    };
  }
}
