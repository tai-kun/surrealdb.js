import isPlainObject from "is-plain-obj";
import { SurrealTypeError, unreachable } from "~/errors";
import { escapeKey, quoteStr } from "./escape";

export type SurqlPrimitive =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

export type SurqlObject =
  | { readonly [_ in string]?: SurqlValue }
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
    switch (typeof x) {
      case "object":
        break;

      case "string":
        // s 接頭辞を付けることで、特定の形式を満たす文字列を別のデータ型に自動変換されないようにします。
        return "s" + quoteStr(x);

      case "number":
        if (!Number.isFinite(x)) {
          throw new SurrealTypeError("The number `" + x + "` is not finite.");
        }

        return "" + x;

      case "bigint":
        return "" + x;

      case "boolean":
        return x && "true" || "false";

      case "undefined":
        return "NONE";

      case "symbol":
      case "function":
        throw new SurrealTypeError("Unexpected type: " + typeof x);

      default:
        unreachable();
    }

    if (x === null) {
      return "NULL";
    }

    if (c.seen.has(x)) {
      throw new SurrealTypeError("Circular reference: " + String(x));
    }

    if (x instanceof Date) {
      return "d" + quoteStr(x.toISOString());
    }

    if (Array.isArray(x)) {
      c.seen.add(x);
      let s = "[";

      for (let i = 0, len = x.length; i < len; i++) {
        i && (s += ",");
        s += inner(x[i], c);
      }

      s += "]";
      c.seen.delete(x);

      return s;
    }

    if (typeof x.toSurql === "function") {
      c.seen.add(x);
      const s = x.toSurql();
      c.seen.delete(x);

      return s;
    }

    if (isPlainObject(x)) {
      c.seen.add(x);
      let s = "{";

      for (
        let i = 0,
          kys = Object.keys(x).sort(),
          len = kys.length;
        i < len;
        i++
      ) {
        i && (s += ",");
        s += escapeKey(kys[i]!) + ":" + inner((x as any)[kys[i]!], c);
      }

      s += "}";
      c.seen.delete(x);

      return s;
    }

    throw new SurrealTypeError("Unexpected object: " + String(x));
  }

  return inner(value, {
    seen: new Set(),
  });
}
