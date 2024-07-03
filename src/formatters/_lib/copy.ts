import Payload from "./Payload";
import type { Formatter } from "./types";

/**
 * 与えられたデータを一度エンコードしてからデコードすることで、データのコピーを行います。
 *
 * @param data コピーするデータ。
 * @returns コピーされたデータ。
 * @example
 * ```ts
 * const formatter = {
 *   encode() {
 *     // ...
 *   },
 *   decode() {
 *     // ...
 *   },
 * };
 * const data = { foo: "bar" };
 * const copied = await copy(formatter, data);
 * ```
 */
export default async function copy<T>(
  formatter: Formatter,
  data: T,
): Promise<T> {
  const rawData = await formatter.encode(data);
  const payload = new Payload(rawData);

  return await formatter.decode(payload) as T;
}
