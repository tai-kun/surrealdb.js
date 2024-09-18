import {
  Table as Base,
  type TableSource,
} from "@tai-kun/surrealdb/data-types/encodable";

export type * from "../encodable/table";

export interface TableLike<TName extends TableSource = TableSource> {
  readonly name: TName;
}

export default class Table<TName extends TableSource = TableSource>
  extends Base<TName>
{
  // @ts-expect-error readonly を外すだけ。
  name: TName;

  constructor(value: TName | TableLike<TName>) {
    super(typeof value === "string" ? value : value.name);
  }

  clone(): this {
    const This = this.constructor as typeof Table;

    return new This(this) as this;
  }
}
