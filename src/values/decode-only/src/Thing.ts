import type { SurqlArray, SurqlValue } from "@tai-kun/surreal/utils";
import type { Table } from "@tai-kun/surreal/values";
import { _defineAsThing } from "../../_shared/define";

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
  tb: string;

  id: ThingId;

  constructor(thing: Readonly<{ tb: string | Table; id: ThingId }>);

  constructor(tb: string | Table, id: ThingId);

  constructor(
    ...args:
      | [Readonly<{ tb: string | Table; id: ThingId }>]
      | [string | Table, ThingId]
  ) {
    _defineAsThing(this);
    const [tb, id] = args.length === 1
      ? [args[0].tb, args[0].id]
      : args;
    this.tb = typeof tb === "string" ? tb : tb.name;
    this.id = id;
  }
}
