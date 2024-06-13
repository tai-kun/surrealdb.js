import { type SurqlValue, SurqlValueAbc, toSurql } from "../../value";
import { escapeIdent } from "../escape";
import { _defineAssertThing } from "../internal";
import type { TableAny } from "../values";

/**
 * テーブル名とテーブル内のレコードの識別子から成るレコード ID を表すクラス。
 */
export default class Thing extends SurqlValueAbc {
  /**
   * テーブル名をエスケープします。
   *
   * @param tb - テーブル名またはテーブル。
   * @returns エスケープされたテーブル名。
   */
  static escapeTb(tb: string | TableAny): string {
    return escapeIdent(typeof tb === "string" ? tb : tb.name);
  }

  /**
   * ID をエスケープします。
   *
   * @param id - ID。
   * @returns エスケープされた ID。
   */
  static escapeId(id: SurqlValue): string {
    if (typeof id !== "string") {
      return toSurql(id);
    }

    switch (id) {
      // ID ジェネレーターはエスケープしない。
      // https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/id.rs#L18-L22
      case "rand()":
      case "ulid()":
      case "uuid()":
        return id;

      default:
        return escapeIdent(id);
    }
  }

  /**
   * @param tb - テーブル名。
   * @param id - テーブル内のレコードの識別子。
   */
  constructor(public tb: string | TableAny, public id: SurqlValue) {
    super();
    _defineAssertThing(this);
  }

  override toString(): `${string}:${any}` {
    return `${Thing.escapeTb(this.tb)}:${Thing.escapeId(this.id)}`;
  }

  toJSON(): `${string}:${any}` {
    return `${Thing.escapeTb(this.tb)}:${Thing.escapeId(this.id)}`;
  }

  toSurql(): `r"${string}:${any}"` {
    return `r"${Thing.escapeTb(this.tb)}:${Thing.escapeId(this.id)}"`;
  }
}
