import { TypeError } from "../../errors";
import { SurqlValueAbc } from "../../value";
import { escapeIdent } from "../escape";
import { _defineAssertTable } from "../internal";

/**
 * テーブルを表すクラス。
 */
export default class Table extends SurqlValueAbc {
  /**
   * テーブル名をエスケープします。
   *
   * @param name - テーブル名。
   * @returns エスケープされたテーブル名。
   */
  static escapeName(name: string): string {
    return escapeIdent(name);
  }

  /**
   * テーブル名。
   */
  name: string;

  /**
   * @param name - テーブル名。
   */
  constructor(name: string) {
    super();
    _defineAssertTable(this);

    if (typeof name !== "string") {
      throw new TypeError("Expected string, but got: " + typeof name);
    }

    this.name = name;
  }

  override toString(): string {
    return this.name;
  }

  toJSON(): string {
    return this.name;
  }

  toSurql(): string {
    return Table.escapeName(this.name);
  }
}
