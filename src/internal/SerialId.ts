/**
 * SerialId is a class that generates incremental IDs.
 * It is used to generate unique IDs for the RPC requests.
 * The IDs are generated in a circular manner, so that the IDs
 * do not exceed the maximum safe integer (`Number.MAX_SAFE_INTEGER`).
 * If the ID exceeds the maximum safe integer, it will be reset to 1.
 */
export class SerialId {
  #id = 0;

  /**
   * Generates the next ID.
   *
   * @returns The next ID.
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
    return (this.#id = this.#id % Number.MAX_SAFE_INTEGER + 1);
  }
}
