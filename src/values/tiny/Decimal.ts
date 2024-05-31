import { _defineAssertDecimal } from "../utils";

/**
 * A class representing a decimal.
 */
class DecimalJs {
  /**
   * The value of the decimal.
   */
  value: string;

  /**
   * @param value - The value of the decimal.
   *                If a number is provided, it will be converted to a string in base 10.
   */
  constructor(value: DecimalJs | number | string) {
    _defineAssertDecimal(this);
    this.value = typeof value === "string"
      ? value
      : typeof value === "number"
      ? value.toString(10)
      : value.value;
  }

  /**
   * Returns the string representation of the decimal.
   */
  toString(): string {
    return this.value;
  }

  /**
   * Returns the JSON representation of the decimal.
   * This is the same as `toString`.
   */
  toJSON(): string {
    return this.toString();
  }
}

export type Decimal = DecimalJs;
export const Decimal = DecimalJs;
