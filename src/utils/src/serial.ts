import { NumberRangeError } from "@tai-kun/surreal/errors";

const MAX_SAFE_INTEGER = 9007199254740991;

/**
 * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/serial/)
 */
export default class Serial {
  protected _id = 0;
  protected _max: number;

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/serial/#constructor)
   */
  constructor(max: number | undefined = MAX_SAFE_INTEGER) {
    if (Number.isSafeInteger(max) && max > 0) {
      this._max = max;
    } else {
      throw new NumberRangeError([1, MAX_SAFE_INTEGER], max, {
        integer: true,
      });
    }
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/serial/#next)
   */
  next(): number {
    return (this._id = this._id % this._max + 1);
  }

  /**
   * [API Reference](https://tai-kun.github.io/surreal.js/reference/utils/serial/#reset)
   */
  reset(): void {
    this._id = 0;
  }
}
