import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsDecimal } from "../_internals/define";

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

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/decimal)
 */
export default class Decimal {
  protected readonly _value: string;

  constructor(source: DecimalSource) {
    assertNumric(this._value = source);
    defineAsDecimal(this);
  }

  toString(): string {
    return this._value;
  }
}
