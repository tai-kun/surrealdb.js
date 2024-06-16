declare module "@tools/assert" {
  type AnyConstructor =
    | (new(...args: any[]) => any)
    | (abstract new(...args: any[]) => any);

  /**
   * Error thrown when an assertion fails.
   *
   * @param message - The message to display when the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/AssertionError
   */
  export declare class AssertionError extends Error {
    constructor(message: string);
  }

  /**
   * Make an assertion, error will be thrown if `expr` does not have truthy value.
   *
   * @param expr - The expression to test.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assert
   */
  export declare function assert(expr: unknown, msg?: string): void;

  /**
   * Make an assertion, error will be thrown if `expr` have truthy value.
   *
   * @param expr - The expression to test.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertFalse
   */
  export declare function assertFalse(expr: unknown, msg?: string): void;

  /**
   * Make an assertion that `actual` and `expected` are equal using `Object.is`
   * for equality comparison. If not, then throw.
   *
   * @template T - The type of the values to compare.
   * @param actual - The actual value.
   * @param expected - The expected value.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertStrictEquals
   */
  export declare function assertEquals<T>(
    actual: T,
    expected: T,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `actual` and `expected` are not equal using `Object.is`
   * for equality comparison. If they are equal, then throw.
   *
   * @template T - The type of the values to compare.
   * @param actual - The actual value.
   * @param expected - The expected value.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertNotStrictEquals
   */
  export declare function assertNotEquals<T>(
    actual: T,
    expected: T,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `actual` and `expected` are equal, deeply. If not
   * deeply equal, then throw.
   *
   * @template T - The type of the values to compare.
   * @param actual - The actual value.
   * @param expected - The expected value.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertEquals
   */
  export declare function assertDeepEquals<T>(
    actual: T,
    expected: T,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `actual` and `expected` are not equal, deeply. If
   * deeply equal, then throw.
   *
   * @template T - The type of the values to compare.
   * @param actual - The actual value.
   * @param expected - The expected value.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertNotEquals
   */
  export declare function assertNotDeepEquals<T>(
    actual: T,
    expected: T,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `actual` and `expected` are equal, deeply. If not
   * deeply equal, then throw.
   *
   * @template T - The type of the values to compare.
   * @param actual - The actual jsonifiable value.
   * @param expected - The expected jsonifiable value.
   * @param msg - The message to display if the assertion fails.
   */
  export declare function assertJsonEquals<
    T extends import("type-fest").Jsonifiable,
  >(
    actual: T,
    expected: import("type-fest").Jsonifiable,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `actual` and `expected` are not equal, deeply. If
   * deeply equal, then throw.
   *
   * @template T - The type of the values to compare.
   * @param actual - The actual jsonifiable value.
   * @param expected - The expected jsonifiable value.
   * @param msg - The message to display if the assertion fails.
   */
  export declare function assertJsonNotEquals<
    T extends import("type-fest").Jsonifiable,
  >(
    actual: T,
    expected: import("type-fest").Jsonifiable,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `actual` match RegExp `expected`. If not then throw.
   *
   * @param actual - The actual value.
   * @param expected - The expected value.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertMatch
   */
  export declare function assertMatch(
    actual: string,
    expected: RegExp,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `actual` does not match RegExp `expected`. If match
   * then throw.
   *
   * @param actual - The actual value.
   * @param expected - The expected value.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertNotMatch
   */
  export declare function assertNotMatch(
    actual: string,
    expected: RegExp,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `obj` is an instance of `type`. If not then throw.
   *
   * @template T - The type of the expected value.
   * @param actual - The actual value.
   * @param expectedType - The expected type.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertInstanceOf
   */
  export declare function assertInstanceOf<T extends AnyConstructor>(
    actual: unknown,
    expectedType: T,
    msg?: string,
  ): void;

  /**
   * Make an assertion that `obj` is not an instance of `type`. If is then throw.
   *
   * @template T - The type of the expected value.
   * @param actual - The actual value.
   * @param expectedType - The expected type.
   * @param msg - The message to display if the assertion fails.
   * @see https://jsr.io/@std/assert@0.226.0/doc/~/assertNotInstanceOf
   */
  export declare function assertNotInstanceOf<T extends AnyConstructor>(
    actual: unknown,
    expectedType: T,
    msg?: string,
  ): void;

  /**
   * Executes a function, expecting it to throw. If it does not, then it throws.
   *
   * To assert that an asynchronous function rejects, use {@link assertRejects}.
   *
   * @param fn - The function to execute.
   * @param msg - The message to display if the assertion fails.
   * @returns The error that was thrown.
   */
  export declare function assertThrows(
    fn: () => unknown,
    msg?: string,
  ): unknown;

  /**
   * Executes a function, expecting it to throw. If it does not, then it throws.
   *
   * To assert that an asynchronous function rejects, use {@link assertRejects}.
   *
   * @template E - The type of the expected error.
   * @param fn - The function to execute.
   * @param ErrorClass - The expected error class.
   * @param msgIncludes - The message that the error should include.
   * @param msg - The message to display if the assertion fails.
   * @returns The error that was thrown.
   */
  export declare function assertThrows<E extends Error = Error>(
    fn: () => unknown,
    ErrorClass: new(...args: any[]) => E,
    msgIncludes?: string,
    msg?: string,
  ): E;

  /**
   * Executes a function which returns a promise, expecting it to reject.
   *
   * To assert that an synchronous function throws, use {@link assertThrows}.
   *
   * @param fn - The function to execute.
   * @param msg - The message to display if the assertion fails.
   * @returns The error that was rejected.
   */
  export declare function assertRejects(
    fn: () => Promise<unknown>,
    msg?: string,
  ): Promise<unknown>;

  /**
   * Executes a function which returns a promise, expecting it to reject.
   *
   * To assert that an synchronous function throws, use {@link assertThrows}.
   *
   * @template E - The type of the expected error.
   * @param fn - The function to execute.
   * @param ErrorClass - The expected error class.
   * @param msgIncludes - The message that the error should include.
   * @param msg - The message to display if the assertion fails.
   * @returns The error that was rejected.
   */
  export declare function assertRejects<E extends Error = Error>(
    fn: () => Promise<unknown>,
    ErrorClass: new(...args: any[]) => E,
    msgIncludes?: string,
    msg?: string,
  ): Promise<E>;

  /**
   * Use this to assert unreachable code.
   *
   * @param reason - The reason why the code should be unreachable.
   */
  export declare function unreachable(reason?: string): never;
}
