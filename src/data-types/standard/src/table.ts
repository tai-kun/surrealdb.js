import type { TableSource } from "@tai-kun/surrealdb/data-types/decode-only";
import { Table as Base } from "@tai-kun/surrealdb/data-types/encodable";

export interface TableLike<T extends TableSource = TableSource> {
  readonly name: T;
}

export default class Table<T extends TableSource = TableSource>
  extends Base<T>
{
  // @ts-expect-error readonly を外すだけ。
  name: T;

  constructor(value: T | TableLike<T>) {
    super(typeof value === "string" ? value : value.name);
  }

  clone(): this {
    const This = this.constructor as typeof Table;

    return new This(this) as this;
  }
}
