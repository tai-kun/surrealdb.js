/******************************************************************************
 * test-env/<env>/use-prelude.js
 *****************************************************************************/

type TestFn = () => void | Promise<void>;

/**
 * The environment in which the test is running.
 */
declare const TEST_ENV:
  // JavaScript/TypeScript runtimes
  | "Bun"
  | "Deno"
  | "Node"
  // Browsers
  | "Chrome"
  | "Firefox"
  // Edge cases
  | "CloudflareWorkers";

/**
 * Defines a test case with the given name and function.
 *
 * @param name - The name of the test case.
 * @param fn - The function that implements the test case.
 */
declare function test(name: string, fn: TestFn): void;

/******************************************************************************
 * test-env/shared/assert.js
 *****************************************************************************/

type AnyConstructor = new(...args: any[]) => any;

/**
 * Error thrown when an assertion fails.
 *
 * @param message - The message to display when the assertion fails.
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/AssertionError
 */
declare class AssertionError extends Error {
  constructor(message: string);
}

/**
 * Make an assertion, error will be thrown if `expr` does not have truthy value.
 *
 * @param expr - The expression to test.
 * @param msg - The message to display if the assertion fails.
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assert
 */
declare function assert(expr: unknown, msg?: string): void;

/**
 * Make an assertion, error will be thrown if `expr` have truthy value.
 *
 * @param expr - The expression to test.
 * @param msg - The message to display if the assertion fails.
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertFalse
 */
declare function assertFalse(expr: unknown, msg?: string): void;

/**
 * Make an assertion that `actual` and `expected` are equal using `Object.is`
 * for equality comparison. If not, then throw.
 *
 * @template T - The type of the values to compare.
 * @param actual - The actual value.
 * @param expected - The expected value.
 * @param msg - The message to display if the assertion fails.
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertStrictEquals
 */
declare function assertEquals<T>(
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
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertNotStrictEquals
 */
declare function assertNotEquals<T>(
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
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertEquals
 */
declare function assertDeepEquals<T>(
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
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertNotEquals
 */
declare function assertNotDeepEquals<T>(
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
declare function assertJsonEquals<T extends import("type-fest").Jsonifiable>(
  actual: T,
  expected: T,
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
declare function assertJsonNotEquals<T extends import("type-fest").Jsonifiable>(
  actual: T,
  expected: T,
  msg?: string,
): void;

/**
 * Make an assertion that `actual` match RegExp `expected`. If not then throw.
 *
 * @param actual - The actual value.
 * @param expected - The expected value.
 * @param msg - The message to display if the assertion fails.
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertMatch
 */
declare function assertMatch(
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
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertNotMatch
 */
declare function assertNotMatch(
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
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertInstanceOf
 */
declare function assertInstanceOf<T extends AnyConstructor>(
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
 * @see https://jsr.io/@std/assert@0.225.2/doc/~/assertNotInstanceOf
 */
declare function assertNotInstanceOf<T extends AnyConstructor>(
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
declare function assertThrows(
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
declare function assertThrows<E extends Error = Error>(
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
declare function assertRejects(
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
declare function assertRejects<E extends Error = Error>(
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
declare function unreachable(reason?: string): never;

/******************************************************************************
 * test-env/shared/browser.js
 * test-env/shared/use-surrealdb.js
 *****************************************************************************/

declare const SURREALDB: {
  ready: Promise<void>;
  host: `${string}:${number}`;
};

/******************************************************************************
 * tests/integration/<engine>-<formatter>-<validator>.setup.ts
 *****************************************************************************/

declare const IT: string;

declare function connect(host: typeof SURREALDB): Promise<
  import("@tai-kun/surrealdb/full").Surreal & {
    [Symbol.asyncDispose](): Promise<void>;
  }
>;
