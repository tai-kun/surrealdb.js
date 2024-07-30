import type { TableSource } from "@tai-kun/surreal/data-types/decode-only";
import { Table as Base } from "@tai-kun/surreal/data-types/encodable";

export interface TableLike<T extends TableSource = TableSource> {
  readonly name: T;
}

export default class Table<T extends TableSource = TableSource>
  extends Base<T>
{
  // @ts-expect-error readonly を外すだけ。
  name: T;

  constructor(tb: T | TableLike<T>) {
    super(typeof tb === "string" ? tb : tb.name);
  }

  clone(): this {
    const This = this.constructor as typeof Table;

    return new This(this) as this;
  }
}
