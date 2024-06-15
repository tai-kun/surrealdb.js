import { TypeError } from "../../errors";
import { _defineAssertTable } from "../internal";

/**
 * テーブルを表すクラス。
 */
export default class Table {
  /**
   * テーブル名。
   */
  name: string;

  /**
   * @param name - テーブル名。
   */
  constructor(name: string) {
    _defineAssertTable(this);

    if (typeof name !== "string") {
      throw new TypeError("Expected string, but got: " + typeof name);
    }

    this.name = name;
  }
}
