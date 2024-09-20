import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsTable } from "../_internals/define";

export type TableSource = DataItem.Utf8String.FixedLength["value"];

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/table)
 */
export default class Table<TName extends TableSource = TableSource> {
  readonly name: TName;

  constructor(source: TName) {
    this.name = source;
    defineAsTable(this);
  }
}
