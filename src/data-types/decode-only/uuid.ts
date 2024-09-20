import { SurrealTypeError, SurrealValueError } from "@tai-kun/surrealdb/errors";
import { defineAsUuid } from "../_internals/define";
import { isValidBytes } from "../_internals/uuid";

export type UuidSource = Uint8Array;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/uuid)
 */
export default class Uuid {
  protected _bytes: Uint8Array;

  constructor(source: UuidSource) {
    defineAsUuid(this);

    if (!(source instanceof Uint8Array)) {
      throw new SurrealTypeError("Uint8Array", source);
    }

    if (!isValidBytes(source)) {
      throw new SurrealValueError("a valid uuid", Array.from(source));
    }

    this._bytes = source;
  }

  get bytes(): Uint8Array {
    return this._bytes;
  }
}
