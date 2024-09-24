import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsThing } from "../_internals/define";

export type ThingTableSource = DataItem.Utf8String.FixedLength["value"];

export type ThingIdSource =
  | DataItem.UnsignedInteger["value"]
  | DataItem.NegativeInteger["value"]
  | DataItem.Utf8String.FixedLength["value"]
  | object; // DataItem.Array, DataItem.Map, DataItem.Map, Uuid, Range

export type ThingSource<
  TTable extends ThingTableSource = ThingTableSource,
  TId extends ThingIdSource = ThingIdSource,
> = readonly [
  table: TTable,
  id: TId,
];

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/thing)
 */
export default class Thing<
  TTable extends ThingTableSource = ThingTableSource,
  TId extends ThingIdSource = ThingIdSource,
> {
  readonly table: TTable;
  readonly id: TId;

  constructor(source: ThingSource<TTable, TId>) {
    [this.table, this.id] = source;
    defineAsThing(this);
  }
}
