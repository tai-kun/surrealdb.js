import {
  CircularReferenceError,
  SurrealTypeError,
  SurrealValueError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import { escapeKey, quoteStr } from "./escape";
import isPlainObject from "./is-plain-object";
import { canToJSON, canToSurql } from "./traits";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/utils/to-surql/)
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
          throw new SurrealValueError("finite-number", x);
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
          ["Object", "String", "Number", "BigInt", "Boolean", "undefined"],
          x,
        );

      default:
        unreachable();
    }

    if (x === null) {
      return "NULL";
    }

    if (c.seen.has(x)) {
      throw new CircularReferenceError(x);
    }

    if (canToSurql(x)) {
      c.seen.add(x);
      const s = x["toSurql"]();
      c.seen.delete(x);

      return s;
    }

    if (x instanceof Date) {
      return "d" + quoteStr(x.toISOString());
    }

    if (canToJSON(x)) {
      c.seen.add(x);
      const s = inner(x["toJSON"](), c);
      c.seen.delete(x);

      return s;
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
        s += escapeKey(kys[i]!) + ":" + inner(x[kys[i]!], c);
      }

      s += "}";
      c.seen.delete(x);

      return s;
    }

    if (x instanceof Set) {
      c.seen.add(x);
      let s = "[";

      for (let i = 0, arr = Array.from(x), len = arr.length; i < len; i++) {
        i && (s += ",");
        s += inner(arr[i], c);
      }

      s += "]";
      c.seen.delete(x);

      return s;
    }

    if (x instanceof Map) {
      c.seen.add(x);
      let s = "{";

      for (
        let i = 0,
          kys = Array.from(x.keys()).sort(),
          len = kys.length;
        i < len;
        i++
      ) {
        i && (s += ",");
        s += inner(kys[i]!, c) + ":" + inner(x.get(kys[i]!), c);
      }

      s += "}";
      c.seen.delete(x);

      return s;
    }

    throw new SurrealTypeError("Object", x);
  }

  return inner(value, {
    seen: new Set(),
  });
}
