import { TypeError } from "../../errors";
import { escapeIdent, type SurqlValueInterface } from "../../value";
import { _defineAssertTable } from "../internal";

/**
 * テーブルを表すクラス。
 */
export default class Table implements SurqlValueInterface {
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
    _defineAssertTable(this);

    if (typeof name !== "string") {
      throw new TypeError("Expected string, but got: " + typeof name);
    }

    this.name = name;
  }

  /**
   * @example
   * ```typescript
   * const table = new Table("0xff");
   * table.toString();
   * // => 0xff
   * ```
   */
  toString(): string {
    return this.name;
  }

  /**
   * @example
   * ```typescript
   * const table = new Table("0xff");
   * table.toJSON();
   * // => 0xff
   * ```
   */
  toJSON(): string {
    return this.name;
  }

  /**
   * @example
   * ```typescript
   * const table = new Table("255");
   * table.toSurql();
   * // => ⟨255⟩
   * ```
   */
  toSurql(): string {
    return Table.escapeName(this.name);
  }
}
