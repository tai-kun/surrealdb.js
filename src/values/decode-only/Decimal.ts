import isSafeNumber from "~/_lib/isSafeNumber";
import { SurrealTypeError } from "~/errors";
import { type Decimal as DecimalLike, isDecimal } from "~/index/values";
import { _defineAssertDecimal } from "../_lib/internal";

// https://github.com/MikeMcl/decimal.js/blob/v10.4.3/decimal.mjs#L109-L112
const BINARY_REGEX = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
const HEX_REGEX = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
const OCTAL_REGEX = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
const DECIMAL_REGEX = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

export default class Decimal {
  protected _value: string;

  /**
   * @param value Decimal の値。10 進数以外の文字列と数値は自動的に 10 進数に変換されます。
   */
  constructor(value: string | number | DecimalLike) {
    _defineAssertDecimal(this);

    if (
      typeof value === "string"
      && (
        DECIMAL_REGEX.test(value)
        || HEX_REGEX.test(value)
        || BINARY_REGEX.test(value)
        || OCTAL_REGEX.test(value)
      )
    ) {
      this._value = value;
    } else if (isSafeNumber(value as number)) {
      this._value = value.toString(10);
    } else if (isDecimal(value)) {
      this._value = value.valueOf();
    } else {
      throw new SurrealTypeError("Invalid Decimal value", { cause: value });
    }
  }

  valueOf(): string {
    return this._value;
  }
}
