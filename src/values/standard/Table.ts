import { BACKTICK, escapeIdent } from "~/index/escape";
import { _defineAssertTable } from "../_lib/internal";
import type { Encodable } from "../_lib/types";

/**
 * テーブルを表すクラス。
 */
export default class Table implements Encodable {
  /**
   * テーブル名をエスケープします。
   *
   * @param name テーブル名。
   * @returns エスケープされたテーブル名。
   */
  static escapeName(name: string): string {
    // SurrealDB では String を escape_ident でエスケープしている:
    // https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/table.rs#L78
    return name && escapeIdent(name) || (BACKTICK + BACKTICK);
  }

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

  toString(): string {
    return this.name;
  }

  /**
   * @example
   * ```ts
   * const table = new Table("0xff");
   * table.toJSON();
   * // 0xff
   * ```
   */
  toJSON(): string {
    return this.name;
  }

  /**
   * @example
   * ```ts
   * const table = new Table("255");
   * table.toSurql();
   * // ⟨255⟩
   * ```
   */
  toSurql(): string {
    return Table.escapeName(this.name);
  }

  structure(): {
    name: string;
  } {
    return {
      name: this.name,
    };
  }
}
