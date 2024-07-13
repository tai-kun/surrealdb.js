import type { SurqlArray, SurqlValue } from "~/index/toSurql";
import type { Table } from "~/index/values";
import { _defineAssertThing } from "../_lib/internal";

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
  readonly tb: string;

  readonly id: ThingId;

  /**
   * @param tb テーブル名。
   * @param id テーブル内のレコードの識別子。
   */
  constructor(tb: string | Table, id: ThingId) {
    _defineAssertThing(this);
    this.tb = typeof tb === "string" ? tb : tb.name;
    this.id = id;
  }
}
