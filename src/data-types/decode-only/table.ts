import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsTable } from "../_internals/define";

export type TableSource = DataItem.Utf8String.FixedLength["value"];

export default class Table<TName extends TableSource = TableSource> {
  readonly name: TName;

  constructor(value: TName) {
    this.name = value;
    defineAsTable(this);
  }
}
