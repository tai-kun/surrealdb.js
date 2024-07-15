import Payload from "./Payload";
import type { Formatter } from "./types";

/**
 * 与えられたデータを一度エンコードしてからデコードすることで、データの複製を行います。
 *
 * @param data 複製するデータ。
 * @returns 複製されたデータ。
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
 * const copied = await clone(formatter, data);
 * ```
 */
export default async function clone<T>(
  formatter: Formatter,
  data: T,
): Promise<T> {
  const rawData = await formatter.encode(data);
  const payload = new Payload(rawData);

  return await formatter.decode(payload) as T;
}
