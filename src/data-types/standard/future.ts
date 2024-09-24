import { Future as Base } from "@tai-kun/surrealdb/data-types/encodable";
import { SurrealTypeError, SurrealValueError } from "@tai-kun/surrealdb/errors";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { escapeTb, toString } from "../_internals/thing";

export type * from "../encodable/future";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/future)
 * @experimental
 */
export default class Future extends Base {
  static raw(value: RawValue): Raw {
    return new Raw(value);
  }

  static surql(
    texts: readonly string[] | TemplateStringsArray,
    ...values: unknown[]
  ): string {
    if (texts.length - values.length !== 1) {
      throw new SurrealValueError(
        "template string",
        `texts.length=${texts.length} and values.length=${values.length}`,
      );
    }

    let text = "";

    for (
      let i = 0,
        j: number,
        v,
        len = texts.length,
        cache: Record<number, string> = {};
      i < len;
      i++
    ) {
      text += texts[i];

      if (i + 1 === len) {
        break;
      }

      for (j = 0; j < i; j++) {
        if (Object.is(values[j], values[i])) {
          break;
        }
      }

      v = values[j];

      if (v instanceof Raw) {
        text += v.toString();
      } else {
        text += cache[j] ??= toSurql(v);
      }
    }

    return text;
  }

  // @ts-expect-error readonly を外すだけ
  block: string;
}

const THING = /* @__PURE__ */ Symbol.for("@tai-kun/surrealdb/data-types/thing");

function isThing(o: unknown): o is {
  readonly table: string;
  readonly id: unknown;
} {
  return !!o
    && typeof o === "object"
    // @ts-expect-error
    && o["$$datatype"] === THING;
}

function isGenerator(id: unknown): id is string {
  return id === "uuid()" || id === "ulid()" || id === "rand()";
}

export type RawValue =
  | string
  | { readonly toSurql: () => string }
  | { readonly toString: () => string }
  | { readonly [Symbol.toPrimitive]: (hint: "string") => string };

class Raw {
  protected _val: RawValue;
  protected _str: string;

  constructor(value: RawValue) {
    this._val = value;

    if (typeof value === "string") {
      this._str = value;
    } else if (value && typeof value === "object") {
      if (isThing(value)) {
        this._str = isGenerator(value.id)
          ? escapeTb(value.table) + ":" + value.id
          : toString(value);
      } else if ("toSurql" in value) {
        this._str = value.toSurql();
      } else if (Object.hasOwn(value, "toString")) {
        this._str = value.toString();
      } else if (Object.hasOwn(value, Symbol.toPrimitive)) {
        this._str = (value as any)[Symbol.toPrimitive]!("string");
      } else {
        throw new SurrealValueError("Object contains encode methods", value);
      }
    } else {
      throw new SurrealTypeError(["String", "Object"], value);
    }
  }

  toString(): string {
    return this._str;
  }
}
