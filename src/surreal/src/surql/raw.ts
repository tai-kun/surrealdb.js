import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { escapeTb, toString } from "~/data-types/_internals/thing";
import { isThing } from "./data-types";

function isGenerator(id: unknown): id is string {
  return id === "uuid()" || id === "ulid()" || id === "rand()";
}

export type RawValue =
  | string
  | { readonly toSurql: () => string }
  | { readonly toString: () => string }
  | { readonly [Symbol.toPrimitive]: (hint: "string") => string };

export default class Raw {
  protected _val: RawValue;
  protected _str: string;

  constructor(value: RawValue) {
    this._val = value;

    if (typeof value === "string") {
      this._str = value;
    } else if (value && typeof value === "object") {
      if (isThing(value)) {
        this._str = isGenerator(value.id)
          ? escapeTb(value.tb) + ":" + value.id
          : toString(value);
      } else if ("toSurql" in value) {
        this._str = value.toSurql();
      } else if (Object.hasOwn(value, "toString")) {
        this._str = value.toString();
      } else if (Object.hasOwn(value, Symbol.toPrimitive)) {
        this._str = (value as any)[Symbol.toPrimitive]!("string");
      } else {
        // TODO(tai-kun): エラーメッセージ改善
        throw new SurrealTypeError("object", typeof value);
      }
    } else {
      // TODO(tai-kun): エラーメッセージ改善
      throw new SurrealTypeError("string | object", typeof value);
    }
  }

  toString(): string {
    return this._str;
  }
}
