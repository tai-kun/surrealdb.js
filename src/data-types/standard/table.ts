import {
  Table as Base,
  type TableSource,
} from "@tai-kun/surrealdb/encodable-datatypes";

export type * from "../encodable/table";

export interface TableLike<TName extends TableSource = TableSource> {
  readonly name: TName;
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/table)
 */
export default class Table<TName extends TableSource = TableSource>
  extends Base<TName>
{
  // @ts-expect-error readonly を外すだけ。
  name: TName;

  constructor(source: TName | TableLike<TName>) {
    super(typeof source === "string" ? source : source.name);
  }

  clone(): this {
    const This = this.constructor as typeof Table;

    return new This(this) as this;
  }
}
