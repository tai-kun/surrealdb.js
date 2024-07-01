import type { Promisable } from "type-fest";

/**
 * 関数を非同期に実行します。同期的にエラーが投げられた場合でも、
 * それが非同期関数によって投げられたエラーであるかのように振る舞います。
 *
 * @param fn 実行する関数。
 * @param args 関数に渡す引数。
 * @returns 実行結果。
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
export default async function runInAsync<T, A extends unknown[]>(
  fn: (...args: A) => Promisable<T>,
  ...args: A
): Promise<T> {
  return await fn(...args);
}
