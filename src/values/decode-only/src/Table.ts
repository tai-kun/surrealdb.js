import { _defineAsTable } from "../../_shared/define";

/**
 * テーブルを表すクラス。
 */
export default class Table {
  /**
   * テーブル名。
   */
  name: string;

  constructor(tb: string | { readonly name: string }) {
    _defineAsTable(this);
    this.name = typeof tb === "string" ? tb : tb.name;
  }
}
