import {
  Thing as Base,
  type ThingIdSource,
  type ThingSource,
  type ThingTableSource,
} from "@tai-kun/surrealdb/encodable-datatypes";
import type { TableLike } from "./table";

export type { ThingIdSource, ThingSource, ThingTableSource };

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/thing)
 */
export default class Thing<
  TTable extends ThingTableSource = ThingTableSource,
  TId extends ThingIdSource = ThingIdSource,
> extends Base<TTable, TId> {
  // @ts-expect-error readonly を外すだけ。
  table: TTable;
  // @ts-expect-error readonly を外すだけ。
  id: TId;

  constructor(source: ThingSource<TTable, TId>);

  constructor(table: TTable | TableLike<TTable>, id: TId);

  constructor(
    ...args:
      | [ThingSource<TTable, TId>]
      | [table: TTable | TableLike<TTable>, id: TId]
  ) {
    const source: readonly [TTable, TId] = args.length === 2
      ? [typeof args[0] === "string" ? args[0] : args[0].name, args[1]]
      : args[0];
    super(source);
  }

  clone(): this {
    const This = this.constructor as typeof Thing;

    return new This(this.table, this.id) as this;
  }
}
