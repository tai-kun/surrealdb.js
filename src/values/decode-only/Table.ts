import { _defineAssertTable } from "../_lib/internal";

/**
 * テーブルを表すクラス。
 */
export default class Table {
  /**
   * テーブル名。
   */
  readonly name: string;

  /**
   * @param name テーブル名。
   */
  constructor(name: string) {
    _defineAssertTable(this);
    this.name = name;
  }
}
