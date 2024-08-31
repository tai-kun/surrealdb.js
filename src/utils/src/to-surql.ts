import {
  CircularReferenceError,
  SurrealTypeError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import isPlainObject from "is-plain-obj";
import { escapeKey, quoteStr } from "./escape";
import { hasToJSON, hasToSurql } from "./traits";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/utils/to-surql/)
 */
export default function toSurql(value: unknown): string {
  function inner(
    x: unknown,
    c: {
      seen: Set<object>;
    },
  ): string {
    switch (typeof x) {
      case "object":
        break;

      case "string":
        return quoteStr(x);

      case "number":
        // Number.MAX_VALUE などを許容するため、Number.isFinite で十分な検証。
        if (!Number.isFinite(x)) {
          throw new SurrealTypeError("finite-number", String(x));
        }

        return x + "";

      case "bigint":
        return x + "";

      case "boolean":
        return x && "true" || "false";

      case "undefined":
        return "NONE";

      case "symbol":
      case "function":
        throw new SurrealTypeError(
          "object | string | number | bigint | boolean | undefined",
          typeof x,
        );

      default:
        unreachable();
    }

    if (x === null) {
      return "NULL";
    }

    if (c.seen.has(x)) {
      throw new CircularReferenceError(String(x));
    }

    const o = x as { readonly [key: string]: unknown }; // cast

    if (hasToSurql(o)) {
      c.seen.add(o);
      const s = o["toSurql"]();
      c.seen.delete(o);

      return s;
    }

    if (o instanceof Date) {
      return "d" + quoteStr(o.toISOString());
    }

    if (hasToJSON(o)) {
      c.seen.add(o);
      const s = inner(o["toJSON"](), c);
      c.seen.delete(o);

      return s;
    }

    if (Array.isArray(o)) {
      c.seen.add(o);
      let s = "[";

      for (let i = 0, len = o.length; i < len; i++) {
        i && (s += ",");
        s += inner(o[i], c);
      }

      s += "]";
      c.seen.delete(o);

      return s;
    }

    if (isPlainObject(o)) {
      c.seen.add(o);
      let s = "{";

      for (
        let i = 0,
          kys = Object.keys(o).sort(),
          len = kys.length;
        i < len;
        i++
      ) {
        i && (s += ",");
        s += escapeKey(kys[i]!) + ":" + inner(o[kys[i]!], c);
      }

      s += "}";
      c.seen.delete(o);

      return s;
    }

    if (o instanceof Set) {
      c.seen.add(o);
      let s = "[";

      for (let i = 0, arr = Array.from(o), len = arr.length; i < len; i++) {
        i && (s += ",");
        s += inner(arr[i], c);
      }

      s += "]";
      c.seen.delete(o);

      return s;
    }

    if (o instanceof Map) {
      c.seen.add(o);
      let s = "{";

      for (
        let i = 0,
          kys = Array.from(o.keys()).sort(),
          len = kys.length;
        i < len;
        i++
      ) {
        i && (s += ",");
        s += inner(kys[i]!, c) + ":" + inner(o.get(kys[i]!), c);
      }

      s += "}";
      c.seen.delete(o);

      return s;
    }

    throw new SurrealTypeError("Object", String(o));
  }

  return inner(value, {
    seen: new Set(),
  });
}
