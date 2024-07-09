import { SurrealTypeError } from "~/errors";

const MAX_SAFE_INTEGER = 9_007_199_254_740_991;

/**
 * 増分 ID を生成するクラス。双方向通信における RPC リクエストの ID を生成するために使用されます。
 * ID は循環的に生成され、ID が `Number.MAX_SAFE_INTEGER` を超えないようにします。
 * ID がその値を超えた場合、1 にリセットされます。
 */
export default class SerialId {
  #id = 0;
  #max: number;

  /**
   * @param max 最大値。
   */
  constructor(max: number | undefined = MAX_SAFE_INTEGER) {
    if (Number.isSafeInteger(max) && max > 0) {
      this.#max = max;
    } else {
      throw new SurrealTypeError(
        `The "max" argument must be of a finite integer greater than 0,`
          + `but received ${max}.`,
      );
    }
  }

  /**
   * 次の ID を取得します。
   *
   * @returns 次の ID。
   * @example
   * ```ts
   * const id = new SerialId();
   * console.log(id.next()); // 1
   * console.log(id.next()); // 2
   * ...
   * console.log(id.next()); // Number.MAX_SAFE_INTEGER
   * console.log(id.next()); // 1
   * ```
   */
  next(): number {
    return (this.#id = this.#id % this.#max + 1);
  }

  /**
   * 内部のカウンターをリセットします。
   */
  reset(): void {
    this.#id = 0;
  }
}
