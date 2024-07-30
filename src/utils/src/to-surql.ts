import {
  CircularReferenceError,
  SurrealTypeError,
  unreachable,
} from "@tai-kun/surreal/errors";
import isPlainObject from "is-plain-obj";
import { escapeKey, quoteStr } from "./escape";

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

    if (typeof o["toSurql"] === "function") {
      c.seen.add(o);
      const s = o["toSurql"]();
      c.seen.delete(o);

      return s;
    }

    if (typeof o["toJSON"] === "function") {
      c.seen.add(o);
      const s = o["toJSON"]();
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
      c.seen.delete(x);

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

    if (o instanceof Date) {
      return "d" + quoteStr(o.toISOString());
    }

    throw new SurrealTypeError("Object", String(o));
  }

  return inner(value, {
    seen: new Set(),
  });
}
