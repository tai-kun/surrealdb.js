import DecimalJs from "decimal.js-light";
import { _defineAssertDecimal } from "../_lib/internal";
import type { Encodable } from "../_lib/types";

interface SurrealDecimal extends Encodable {
  toJSON(): string;
  toSurql(): string;
  structure(): {
    value: string;
  };
  [Symbol.toPrimitive]: {
    (hint: "default" | "string"): string;
    (hint: "number"): number;
    (hint: string): string | number;
  };
}

declare module "decimal.js-light" {
  export interface Decimal extends SurrealDecimal {}
}

_defineAssertDecimal(DecimalJs.prototype);

Object.assign<any, SurrealDecimal>(DecimalJs.prototype, {
  [Symbol.toPrimitive](this: DecimalJs, hint: string): any {
    switch (hint) {
      case "number":
        return Number(this.valueOf());

      case "string":
      case "default":
        return this.valueOf();

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  },
  toJSON(this: DecimalJs): string {
    return this.valueOf();
  },
  toSurql(this: DecimalJs): string {
    return this.valueOf() + "dec";
  },
  structure(this: DecimalJs): {
    value: string;
  } {
    return {
      value: this.valueOf(),
    };
  },
});

export default DecimalJs;
