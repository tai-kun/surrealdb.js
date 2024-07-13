import type { Encodable } from "../_lib/types";
import Base from "../decode-only/Decimal";

export default class Decimal extends Base implements Encodable {
  override toString(): string {
    return this._value;
  }

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

  toJSON(): string {
    return this._value;
  }

  toSurql(): string {
    return this._value + "dec";
  }

  structure(): {
    value: string;
  } {
    return {
      value: this._value,
    };
  }
}
