import {
  CBOR_TAG_STRING_DECIMAL,
  type Encodable,
} from "@tai-kun/surrealdb/data-types/encodable";
import { Big as Decimal } from "big.js";
import { defineAsDecimal } from "~/data-types/define";

interface EncodableBig extends Omit<Encodable, "toJSON"> {
  [Symbol.toPrimitive]: {
    (hint: "default" | "string"): string;
    (hint: "number"): number;
    (hint: string): string | number;
  };
  toCBOR(): [
    tag: typeof CBOR_TAG_STRING_DECIMAL,
    value: string,
  ];
}

declare module "big.js" {
  interface Big extends EncodableBig {}
}

defineAsDecimal(Decimal.prototype);
Object.assign<any, EncodableBig>(Decimal.prototype, {
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
});

export default Decimal;
