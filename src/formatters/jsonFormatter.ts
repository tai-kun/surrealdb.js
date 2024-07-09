import isPlainObject from "is-plain-obj";
import type { JsonValue } from "type-fest";
import { SurrealTypeError, unreachable } from "~/errors";
import type Payload from "./_lib/Payload";
import type { Formatter } from "./_lib/types";

// https://github.com/fastify/fast-json-stringify/blob/master/lib/serializer.js
const STR_ESCAPE = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;

const jsonFormatter: Formatter = {
  mimeType: "application/json",
  encode(data: unknown): string {
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
          if (x.length < 5_000 && !STR_ESCAPE.test(x)) {
            return "\"" + x + "\"";
          }

          return JSON.stringify(x);

        case "number":
          // Number.MAX_VALUE などを許容するため、Number.isFinite で十分。
          if (!Number.isFinite(x)) {
            throw new SurrealTypeError("The number `" + x + "` is not finite.");
          }

          return "" + x;

        case "bigint":
          return "" + x;

        case "boolean":
          return x && "true" || "false";

        case "symbol":
        case "function":
        case "undefined":
          throw new SurrealTypeError("Unexpected type: " + typeof x);

        default:
          unreachable();
      }

      if (x === null) {
        return "null";
      }

      if (x instanceof Date) {
        return x.toISOString();
      }

      if (c.seen.has(x)) {
        throw new SurrealTypeError("Circular reference: " + String(x));
      }

      if (Array.isArray(x)) {
        c.seen.add(x);
        let s = "[";

        for (let i = 0, len = x.length; i < len; i++) {
          i && (s += ",");

          if (x[i] === undefined) {
            s += "null";
          } else {
            s += inner(x[i], c);
          }
        }

        s += "]";
        c.seen.delete(x);

        return s;
      }

      if (typeof (x as any)["toJSON"] === "function") {
        c.seen.add(x);
        const s = inner((x as any).toJSON(), c);
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
          if ((x as any)[kys[i]!] !== undefined) {
            i && (s += ",");
            s += inner(kys[i], c) + ":" + inner((x as any)[kys[i]!], c);
          }
        }

        s += "}";
        c.seen.delete(x);

        return s;
      }

      throw new SurrealTypeError("Unexpected object: " + String(x));
    }

    return inner(data, {
      seen: new Set(),
    });
  },
  async decode(payload: Payload): Promise<JsonValue> {
    return JSON.parse(await payload.text());
  },
};

export default jsonFormatter;
