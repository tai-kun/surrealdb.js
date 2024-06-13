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

  /**
   * @example
   * ```typescript
   * const thing = new Thing("tb", {
   *   string: "あいうえお😢",
   *   number: [
   *     123,
   *     3.14,
   *   ],
   *   bigint: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
   *   boolean: [
   *     true,
   *     false,
   *   ],
   *   null: null,
   *   undefined: undefined,
   *   date: new Date(0),
   * });
   * thing.toString();
   * // => tb:{"bigint":9007199254740992,"boolean":[true,false],"date":d"1970-01-01T00:00:00.000Z","null":NULL,"number":[123,3.14],"string":s"あいうえお😢","undefined":NONE}
   * ```
   */
  override toString(): `${string}:${any}` {
    return `${Thing.escapeTb(this.tb)}:${Thing.escapeId(this.id)}`;
  }

  /**
   * @example
   * ```typescript
   * const thing = new Thing("tb", {
   *   string: "あいうえお😢",
   *   number: [
   *     123,
   *     3.14,
   *   ],
   *   bigint: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
   *   boolean: [
   *     true,
   *     false,
   *   ],
   *   null: null,
   *   undefined: undefined,
   *   date: new Date(0),
   * });
   * thing.toString();
   * // => tb:{"bigint":9007199254740992,"boolean":[true,false],"date":d"1970-01-01T00:00:00.000Z","null":NULL,"number":[123,3.14],"string":s"あいうえお😢","undefined":NONE}
   * ```
   */
  toJSON(): `${string}:${any}` {
    return `${Thing.escapeTb(this.tb)}:${Thing.escapeId(this.id)}`;
  }

  /**
   * @example
   * ```typescript
   * const thing = new Thing("tb", {
   *   string: "あいうえお😢",
   *   number: [
   *     123,
   *     3.14,
   *   ],
   *   bigint: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
   *   boolean: [
   *     true,
   *     false,
   *   ],
   *   null: null,
   *   undefined: undefined,
   *   date: new Date(0),
   * });
   * thing.toString();
   * // => r"tb:{\"bigint\":9007199254740992,\"boolean\":[true,false],\"date\":d\"1970-01-01T00:00:00.000Z\",\"null\":NULL,\"number\":[123,3.14],\"string\":s\"あいうえお😢\",\"undefined\":NONE}"
   * ```
   */
  toSurql(): `r"${string}:${any}"` {
    return `r${
      JSON.stringify(
        Thing.escapeTb(this.tb)
          + ":"
          + Thing.escapeId(this.id),
      )
    }` as `r"${string}:${any}"`;
  }
}
