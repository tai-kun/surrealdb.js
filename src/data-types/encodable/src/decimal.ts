import { Decimal as Base } from "@tai-kun/surreal/data-types/decode-only";
import { type Encodable, TAG_STRING_DECIMAL } from "./spec";

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
    tag: typeof TAG_STRING_DECIMAL,
    value: string,
  ] {
    return [
      TAG_STRING_DECIMAL,
      this._value,
    ];
  }

  toJSON(): string {
    return this._value;
  }

  toSurql(): string {
    return this._value + "dec";
  }
}
