import { Table as TableBase } from "../tiny/Table";
import { escapeIdent } from "../utils";

export class Table<T extends string = string> extends TableBase<T> {
  static escape(name: string): string {
    return escapeIdent(name);
  }
}
