import {
  Table as Base,
  type TableSource,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { escapeIdent } from "@tai-kun/surrealdb/utils";
import { CBOR_TAG_TABLE, type Encodable } from "./spec";

export default class Table<T extends TableSource = TableSource> extends Base<T>
  implements Encodable
{
  structure(): Record<string, unknown> {
    throw new Error("Method not implemented.");
  }
  override valueOf(): T {
    return this.name;
  }

  override toString(): T {
    return this.name;
  }

  [Symbol.toPrimitive](hint: "default" | "string"): T;
  [Symbol.toPrimitive](hint: string): T;
  [Symbol.toPrimitive](hint: string): T {
    switch (hint) {
      case "string":
      case "default":
        return this.name;

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  }

  toCBOR(): [tag: typeof CBOR_TAG_TABLE, value: T] {
    return [CBOR_TAG_TABLE, this.name];
  }

  toJSON(): T {
    return this.name;
  }

  toSurql(): string {
    // SurrealDB では String を escape_ident でエスケープしている:
    // https://github.com/surrealdbdb/surrealdbdb/blob/v2.0.0-alpha.7/core/src/sql/table.rs#L78
    return escapeIdent(this.name);
  }

  structrue(): {
    name: string;
  } {
    return {
      name: this.name,
    };
  }
}
