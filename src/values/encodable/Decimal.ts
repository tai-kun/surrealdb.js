import type { Encodable } from "../_lib/types";
import Base from "../decode-only/Decimal";

export default class Decimal extends Base implements Encodable {
  override toString(): string {
    return this.valueOf();
  }

  [Symbol.toPrimitive](hint: "default" | "string"): string;
  [Symbol.toPrimitive](hint: "number"): number;
  [Symbol.toPrimitive](hint: string): string | number;
  [Symbol.toPrimitive](hint: string): string | number {
    switch (hint) {
      case "number":
        return Number(this.valueOf());

      case "string":
      case "default":
        return this.valueOf();

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  }

  toJSON(): string {
    return this.valueOf();
  }

  toSurql(): string {
    return this.valueOf() + "dec";
  }

  structure(): {
    value: string;
  } {
    return {
      value: this.valueOf(),
    };
  }
}
