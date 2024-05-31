import type { Promisable } from "type-fest";

/**
 * Run a function in an async context.
 *
 * Even if an error is thrown synchronously,
 * it will be handled as if the error was thrown by an asynchronous function.
 *
 * @param fn - The function to run.
 * @param args - The arguments to pass to the function.
 * @returns The result of the function.
 * @example
 * ```ts
 * runInAsync((): Promise<any> => {
 *    throw "error"; // throw an error synchronously
 * }).then(
 *   () => {},
 *   reason => console.log(reason), // "error"
 * );
 * ```
 */
export async function runInAsync<T, A extends unknown[]>(
  fn: (...args: A) => Promisable<T>,
  ...args: A
): Promise<T> {
  return await fn(...args);
}
