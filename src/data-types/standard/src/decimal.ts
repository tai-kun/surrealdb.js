import {
  CBOR_TAG_STRING_DECIMAL,
  type Encodable,
} from "@tai-kun/surrealdb/data-types/encodable";
import { Big as Decimal, type BigSource } from "big.js";
import { defineAsDecimal } from "../../_internals/define";

export type DecimalSource = BigSource;

interface StandardExtension extends Omit<Encodable, "toJSON"> {
  [Symbol.toPrimitive]: {
    (hint: "default" | "string"): string;
    (hint: "number"): number;
    (hint: string): string | number;
  };
  toCBOR(): [
    tag: typeof CBOR_TAG_STRING_DECIMAL,
    value: string,
  ];
  toPlainObject(): {
    value: string;
    singleDigits: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    /** Integer, -1e+6 ~ 1e+6 */
    exponent: number;
    sign: -1 | 1;
  };
  clone(): Decimal;
}

declare module "big.js" {
  interface Big extends StandardExtension {}
}

defineAsDecimal(Decimal.prototype);
Object.assign<any, StandardExtension>(Decimal.prototype, {
  [Symbol.toPrimitive](this: Decimal, hint: string): any {
    switch (hint) {
      case "number":
        return this.toNumber();

      case "string":
      case "default":
        return this.toString();

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  },
  toCBOR(this: Decimal): [
    tag: typeof CBOR_TAG_STRING_DECIMAL,
    value: string,
  ] {
    return [
      CBOR_TAG_STRING_DECIMAL,
      this.toString(),
    ];
  },
  toSurql(this: Decimal): string {
    return this.toString() + "dec";
  },
  toPlainObject(this: Decimal): {
    value: string;
    singleDigits: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    exponent: number;
    sign: -1 | 1;
  } {
    return {
      value: this.toString(),
      // @ts-expect-error
      singleDigits: this.c.slice(), // copy
      exponent: this.e,
      // @ts-expect-error
      sign: this.s,
    };
  },
  clone(this: Decimal) {
    const This = this.constructor as typeof Decimal;

    return new This(this.toString());
  },
});

export default Decimal;
