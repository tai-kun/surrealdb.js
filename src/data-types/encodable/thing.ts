import {
  Thing as Base,
  type ThingIdSource,
  type ThingSource,
  type ThingTableSource,
} from "@tai-kun/surrealdb/decodeonly-datatypes";
import { quoteStr } from "@tai-kun/surrealdb/utils";
import { toString } from "../_internals/thing";
import { CBOR_TAG_RECORDID, type Encodable } from "./spec";

export type { ThingIdSource, ThingSource, ThingTableSource };

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/thing)
 */
export default class Thing<
  TTable extends ThingTableSource = ThingTableSource,
  TId extends ThingIdSource = ThingIdSource,
> extends Base<TTable, TId> implements Encodable {
  override valueOf(): string {
    return this.toString();
  }

  override toString(): string {
    return toString(this);
  }

  [Symbol.toPrimitive](hint: "default" | "string"): string;
  [Symbol.toPrimitive](hint: string): string;
  [Symbol.toPrimitive](hint: string): string {
    switch (hint) {
      case "string":
      case "default":
        return this.toString();

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_RECORDID,
    value: [table: TTable, id: TId] | string,
  ] {
    // ID ジェネレーターを使いたければ surql`${surql.raw(<...>)}` を使う。
    return [CBOR_TAG_RECORDID, [this.table, this.id]];
  }

  toJSON(): string {
    return this.toString();
  }

  toSurql(): string {
    return "r" + quoteStr(this.toString());
  }

  toPlainObject(): {
    table: TTable;
    id: TId;
  } {
    return {
      table: this.table,
      id: this.id,
    };
  }
}
