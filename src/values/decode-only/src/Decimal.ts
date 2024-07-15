import { SurrealTypeError } from "@tai-kun/surreal/errors";
import { isSafeNumber } from "@tai-kun/surreal/utils";
import { _defineAsDecimal } from "../../_shared/define";

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
  constructor(value: string | number | { readonly valueOf: () => string }) {
    _defineAsDecimal(this);

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
    } else if (
      value
      && typeof value === "object"
      && typeof value.valueOf === "function"
    ) {
      this._value = value.valueOf();
    } else {
      throw new SurrealTypeError("Invalid Decimal value", { cause: value });
    }
  }

  valueOf(): string {
    return this._value;
  }
}
