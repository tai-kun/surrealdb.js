import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsTable } from "../../_internals/define";

export type TableSource = DataItem.Utf8String.FixedLength["value"];

export default class Table<T extends TableSource = TableSource> {
  readonly name: T;

  constructor(value: T) {
    this.name = value;
    defineAsTable(this);
  }
}
