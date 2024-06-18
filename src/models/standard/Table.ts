import { BACKTICK, escapeIdent } from "../../escape";
import type { SurqlValueSerializer } from "../Serializer";
import Base from "../tiny/Table";

export default class Table extends Base implements SurqlValueSerializer {
  /**
   * テーブル名をエスケープします。
   *
   * @param name - テーブル名。
   * @returns エスケープされたテーブル名。
   */
  static escapeName(name: string): string {
    // SurrealDB では String を escape_ident でエスケープしている:
    // https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/table.rs#L78

    if (name === "") {
      return BACKTICK + BACKTICK;
    }

    return escapeIdent(name);
  }

  /**
   * @example
   * ```typescript
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
   * ```typescript
   * const table = new Table("255");
   * table.toSurql();
   * // ⟨255⟩
   * ```
   */
  toSurql(): string {
    return Table.escapeName(this.name);
  }
}
