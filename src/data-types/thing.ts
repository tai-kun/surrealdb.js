import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { escapeRid, toSurql } from "@tai-kun/surrealdb/utils";

export { escapeRid as escapeTb };

export function escapeId(id: unknown): string {
  switch (typeof id) {
    case "string":
      return escapeRid(id);

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

export function toString(
  thing: {
    readonly tb: string;
    readonly id: unknown;
  },
): string {
  // SurrealDB では String を escape_rid でエスケープしている:
  // https://github.com/surrealdbdb/surrealdbdb/blob/v2.0.0-alpha.7/core/src/sql/thing.rs#L97
  return escapeRid(thing.tb) + ":" + escapeId(thing.id);
}
