import {
  Thing as Base,
  type ThingSource,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { escapeRid, quoteStr, toSurql } from "@tai-kun/surrealdb/utils";
import { CBOR_TAG_RECORDID, type Encodable } from "./spec";

function escapeId(id: unknown): string {
  switch (typeof id) {
    case "string":
      switch (id) {
        case "ulid()":
        case "uuid()":
        case "rand()":
          return id;

        default:
          return escapeRid(id);
      }

    case "number":
      if (id !== id || id === Infinity || id === -Infinity) {
        break;
      }

      return id < 0 || !Number.isInteger(id)
        ? escapeRid(id + "")
        : Object.is(id, -0)
        ? escapeRid("-0")
        : (id + "");

    case "bigint":
      return id < 0
        ? escapeRid(id + "")
        : (id + "");

    case "object":
      if (id === null) {
        break;
      }

      return toSurql(id);
  }

  throw new SurrealTypeError(
    "string | number | bigint | object",
    id === null ? "null" : typeof id,
  );
}

export default class Thing<T extends ThingSource[0] = ThingSource[0]>
  extends Base<T>
  implements Encodable
{
  override valueOf(): string {
    return this.toString();
  }

  override toString(): string {
    // SurrealDB では String を escape_rid でエスケープしている:
    // https://github.com/surrealdbdb/surrealdbdb/blob/v2.0.0-alpha.7/core/src/sql/thing.rs#L97
    return escapeRid(this.tb) + ":" + escapeId(this.id);
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

  toCBOR(): [tag: typeof CBOR_TAG_RECORDID, value: [tb: string, id: unknown]] {
    return [CBOR_TAG_RECORDID, [this.tb, this.id]];
  }

  toJSON(): string {
    return this.toString();
  }

  toSurql(): string {
    return "r" + quoteStr(this.toString());
  }
}
