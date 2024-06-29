import type { Jsonifiable } from "type-fest";

/**
 * SurrealQL の値をシリアライズするインターフェース。
 */
export interface SurqlValueSerializer {
  /**
   * JSON 形式で SurrealQL の変数として扱える値に変換します。
   *
   * @returns JSON 形式で SurrealQL の変数として扱える値。
   */
  toJSON(): Jsonifiable;
  /**
   * SurrealQL に直接埋め込める文字列に変換します。
   *
   * @returns SurrealQL に直接埋め込める文字列。
   */
  toSurql(): string;
}
