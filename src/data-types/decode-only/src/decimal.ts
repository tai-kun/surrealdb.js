import type { DataItem } from "@tai-kun/surreal/cbor";
import { defineAsDecimal } from "~/data-types/define";

export type DecimalSource = DataItem.Utf8String.FixedLength["value"];

// https://github.com/MikeMcl/big.js/blob/v6.2.1/big.mjs#L62-L63
const NAME = "[big.js] ";
const INVALID = NAME + "Invalid ";

// https://github.com/MikeMcl/big.js/blob/v6.2.1/big.mjs#L71
const NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

// https://github.com/MikeMcl/big.js/blob/v6.2.1/big.mjs#L138-L140
function assertNumric(n: string): void {
  if (!NUMERIC.test(n)) {
    throw Error(INVALID + "number");
  }
}

export default class Decimal {
  protected readonly _value: string;

  constructor(value: DecimalSource) {
    assertNumric(this._value = value);
    defineAsDecimal(this);
  }

  toString(): string {
    return this._value;
  }
}
