import type { Jsonifiable } from "type-fest";

export default abstract class SurqlValueAbc {
  /**
   * SurrealQL の変数の値に変換します。
   *
   * @returns SurrealQL の変数の値。
   */
  abstract toJSON(): Jsonifiable;

  /**
   * SurrealQL に直接埋め込める文字列に変換します。
   *
   * @returns SurrealQL に直接埋め込める文字列。
   */
  abstract toSurql(): string;
}
