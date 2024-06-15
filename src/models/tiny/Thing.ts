import type { SurqlArray, SurqlValue } from "../../value";
import { _defineAssertThing } from "../internal";
import type { TableAny } from "../values";

/**
 * ID には 64 ビット符号付き整数と文字列、配列、オオブジェクトが使えます。
 *
 * @see https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/id.rs#L28-L34
 */
export type ThingId =
  | string
  | number
  | bigint
  | { readonly [_ in string | number]?: SurqlValue }
  | { readonly toSurql: () => string }
  | SurqlArray;

/**
 * テーブル名とテーブル内のレコードの識別子から成るレコード ID を表すクラス。
 */
export default class Thing {
  /**
   * @param tb - テーブル名。
   * @param id - テーブル内のレコードの識別子。
   */
  constructor(public tb: string | TableAny, public id: ThingId) {
    _defineAssertThing(this);
  }
}
