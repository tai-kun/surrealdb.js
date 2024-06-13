import type { SurqlValue } from "./toSurql";

export default abstract class SurqlValueAbc {
  /**
   * SurrealQL の変数の値に変換します。
   *
   * @returns SurrealQL の変数の値。
   */
  abstract toJSON(): SurqlValue;

  /**
   * SurrealQL に直接埋め込める文字列に変換します。
   *
   * @returns SurrealQL に直接埋め込める文字列。
   */
  abstract toSurql(): string;
}
