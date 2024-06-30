import { SurrealDbTypeError } from "~/errors";
import { isDecimal } from "~/index/values";
import { _defineAssertDecimal } from "../../_values/internal";

// https://github.com/MikeMcl/decimal.js/blob/master/decimal.mjs#L109-L112
const BINARY_REGEX = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
const HEX_REGEX = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
const OCTAL_REGEX = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
const DECIMAL_REGEX = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

export default class Decimal {
  #value: string;

  /**
   * @param value - Decimal の値。10 進数以外の文字列と数値は自動的に 10 進数に変換されます。
   */
  constructor(value: Decimal | number | string) {
    _defineAssertDecimal(this);

    if (typeof value === "string") {
      if (
        BINARY_REGEX.test(value)
        || HEX_REGEX.test(value)
        || OCTAL_REGEX.test(value)
      ) {
        this.#value = parseFloat(value).toString(10);
      } else if (DECIMAL_REGEX.test(value)) {
        this.#value = value;
      } else {
        throw new SurrealDbTypeError("Invalid Decimal string", {
          cause: value,
        });
      }
    } else if (typeof value === "number") {
      this.#value = value.toString(10);
    } else if (isDecimal(value)) {
      this.#value = value.valueOf();
    } else {
      throw new SurrealDbTypeError("Invalid Decimal value", { cause: value });
    }
  }

  valueOf(): string {
    return this.#value;
  }
}
