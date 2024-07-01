import isPlainObject from "is-plain-obj";
import { SurrealDbTypeError } from "~/errors";
import { escapeKey, quoteStr } from "./escape";

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
 * @param value 変換する値。
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
      // s 接頭辞を付けることで、特定の形式を満たす文字列を別のデータ型に自動変換されないようにします。
      return "s" + quoteStr(x);
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
        throw new SurrealDbTypeError("Circular reference");
      }

      c.seen.add(x);
      s = "[" + x.map(v => inner(v, c)).join(",") + "]";
      c.seen.delete(x);

      return s;
    }

    if (typeof x === "object") {
      if (c.seen.has(x)) {
        throw new SurrealDbTypeError("Circular reference");
      }

      c.seen.add(x);

      if (x instanceof Date) {
        s = "d" + quoteStr(x.toISOString());
      } else if (typeof x.toSurql === "function") {
        s = x.toSurql();
      } else if (isPlainObject(x)) {
        s = "{"
          + Object.entries(x)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => escapeKey(k) + ":" + inner(v, c))
            .join(",")
          + "}";
      }

      c.seen.delete(x);

      if (s !== undefined) {
        return s;
      }
    }

    throw new SurrealDbTypeError("Unexpected value: " + String(x));
  }

  return inner(value, {
    seen: new Set(),
  });
}
