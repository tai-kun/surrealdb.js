import type { Jsonifiable } from "type-fest";

/**
 * SurrealQL の値をエンコードするインターフェース。
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

export type StructurePrimitive = string | number | bigint | boolean | null;

export type StructureObject = { [_ in string]?: StructureValue };

export type StructureArray = StructureValue[];

export type StructureValue =
  | StructurePrimitive
  | StructureObject
  | StructureArray;

/**
 * SurrealQL の値をエンコードするインターフェース。
 */
export interface Encodable {
  toJSON(): Jsonifiable;
  toSurql(): string;
  structure(): StructureObject;
}
