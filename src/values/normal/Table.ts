import { Table as TableBase } from "../tiny/Table";
import { escapeRid } from "../tiny/Thing";

export class Table<T extends string = string> extends TableBase<T> {
  static escape(name: string): string {
    return escapeRid(name);
  }
}
