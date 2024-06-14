import type { Jsonifiable } from "type-fest";

/**
 * SurrealQL の値を実装するインターフェース。
 */
export default interface SurqlValueInterface {
  /**
   * SurrealQL の変数の値に変換します。
   *
   * @returns SurrealQL の変数の値。
   */
  toJSON(): Jsonifiable;

  /**
   * SurrealQL に直接埋め込める文字列に変換します。
   *
   * @returns SurrealQL に直接埋め込める文字列。
   */
  toSurql(): string;
}
