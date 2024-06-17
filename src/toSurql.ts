import isPlainObject from "is-plain-obj";
import { TypeError } from "./errors";

export type SurqlPrimitive =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

export type SurqlObject =
  | { readonly [_ in string | number]?: SurqlValue }
  | { readonly toSurql: () => string }
  | Date;

export type SurqlArray = readonly SurqlValue[];

export type SurqlValue = SurqlPrimitive | SurqlObject | SurqlArray;

/**
 * 値を SurrealQL に直接埋め込める文字列に変換します。
 *
 * @param value - 変換する値。
 * @returns SurrealQL に直接埋め込める文字列。
 */
export default function toSurql(value: SurqlValue): string {
  function inner(
    x: SurqlValue,
    c: {
      seen: Set<SurqlObject | SurqlArray>;
    },
  ): string {
    if (typeof x === "string") {
      return "s" + JSON.stringify(x);
    }

    if (typeof x === "number" || typeof x === "bigint") {
      return x.toString(10);
    }

    if (typeof x === "boolean") {
      return x
        ? "true"
        : "false";
    }

    if (x === null) {
      return "NULL";
    }

    if (x === undefined) {
      return "NONE";
    }

    let s: string | undefined;

    if (Array.isArray(x)) {
      if (c.seen.has(x)) {
        throw new TypeError("Circular reference");
      }

      c.seen.add(x);
      s = "[" + x.map(v => inner(v, c)).join(",") + "]";
      c.seen.delete(x);

      return s;
    }

    if (typeof x === "object") {
      if (c.seen.has(x)) {
        throw new TypeError("Circular reference");
      }

      c.seen.add(x);

      if (x instanceof Date) {
        s = "d\"" + x.toISOString() + "\"";
      } else if (typeof x.toSurql === "function") {
        s = inner(x.toSurql(), c);
      } else if (isPlainObject(x)) {
        s = "{"
          + Object.entries(x)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => JSON.stringify(k) + ":" + inner(v, c))
            .join(",")
          + "}";
      }

      c.seen.delete(x);

      if (s !== undefined) {
        return s;
      }
    }

    throw new TypeError("Unexpected value: " + String(x));
  }

  return inner(value, {
    seen: new Set(),
  });
}
