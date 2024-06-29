import isPlainObject from "is-plain-obj";
import { TypeError } from "../../../common/errors";
import {
  BRACKETL,
  BRACKETR,
  escapeRid,
  quoteStr,
} from "../../../common/escape";
import toSurql from "../../../common/toSurql";
import type { TableType } from "../../../common/values";
import type { SurqlValueSerializer } from "../../_values/Serializer";
import Base, { type ThingId } from "../../tiny/values/Thing";

const I64_MAX = 9223372036854775807n;
const I64_MIN = -9223372036854775808n;

export default class Thing extends Base implements SurqlValueSerializer {
  /**
   * テーブル名をエスケープします。
   *
   * @param tb - テーブル名またはテーブル。
   * @returns エスケープされたテーブル名。
   */
  static escapeTb(tb: string | TableType): string {
    // SurrealDB では String を escape_rid でエスケープしている:
    // https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/thing.rs#L96

    const str = typeof tb === "string" ? tb : tb.name;

    if (str === "") {
      return BRACKETL + BRACKETR;
    }

    return escapeRid(str);
  }

  /**
   * ID をエスケープします。64 ビットの範囲を超える `bigint` リテラルはエスケープされます。
   * 数値が NaN または Infinity の場合、エラーが発生します。
   *
   * @param id - ID。
   * @returns エスケープされた ID。
   */
  static escapeId(id: ThingId): string {
    // Parser: https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/syn/v2/parser/thing.rs#L227-L325
    // Formatter: https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/id.rs#L166-L178

    if (typeof id === "string") {
      // ID 生成関数
      if (id === "ulid()" || id === "uuid()" || id === "rand()") {
        return id;
      }

      if (id === "") {
        return BRACKETL + BRACKETR;
      }

      return escapeRid(id);
    }

    if (typeof id === "number") {
      if (Number.isNaN(id) || !Number.isFinite(id)) {
        throw new TypeError("Invalid ID", { cause: id });
      }

      if (Number.isInteger(id)) {
        return id.toString(10);
      }

      return BRACKETL + id.toString(10) + BRACKETR;
    }

    if (typeof id === "bigint") {
      if (I64_MIN <= id && id <= I64_MAX) {
        return id.toString(10);
      }

      return BRACKETL + id.toString(10) + BRACKETR;
    }

    if (
      Array.isArray(id)
      || (typeof id === "object" && typeof id.toSurql === "function")
      || isPlainObject(id)
    ) {
      return toSurql(id);
    }

    throw new TypeError("Invalid ID", { cause: id });
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
   * // tb:{"bigint":9007199254740992,"boolean":[true,false],"date":d"1970-01-01T00:00:00.000Z","null":NULL,"number":[123,3.14],"string":s"あいうえお😢","undefined":NONE}
   * ```
   */
  toJSON(): string {
    return Thing.escapeTb(this.tb) + ":" + Thing.escapeId(this.id);
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
   * // r"tb:{\"bigint\":9007199254740992,\"boolean\":[true,false],\"date\":d\"1970-01-01T00:00:00.000Z\",\"null\":NULL,\"number\":[123,3.14],\"string\":s\"あいうえお😢\",\"undefined\":NONE}"
   * ```
   */
  toSurql(): string {
    return "r" + quoteStr(this.toJSON());
  }
}
