import type { DataItem } from "@tai-kun/surreal/cbor";
import { defineAsTable } from "~/data-types/define";

export type TableSource = DataItem.Utf8String.FixedLength["value"];

export default class Table<T extends TableSource = TableSource> {
  readonly name: T;

  constructor(tb: T) {
    this.name = tb;
    defineAsTable(this);
  }
}
