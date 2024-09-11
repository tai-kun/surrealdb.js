import { SurrealTypeError, SurrealValueError } from "@tai-kun/surrealdb/errors";
import { defineAsUuid } from "../_internals/define";
import { isValidBytes } from "../_internals/uuid";

export type UuidSource = Uint8Array;

export default class Uuid {
  protected _bytes: Uint8Array;

  constructor(value: UuidSource) {
    defineAsUuid(this);

    if (!(value instanceof Uint8Array)) {
      throw new SurrealTypeError("Uint8Array", value);
    }

    if (!isValidBytes(value)) {
      throw new SurrealValueError("a valid uuid", Array.from(value));
    }

    this._bytes = value;
  }

  get bytes(): Uint8Array {
    return this._bytes;
  }
}
