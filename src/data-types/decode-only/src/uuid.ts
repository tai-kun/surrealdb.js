import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { defineAsUuid } from "~/data-types/define";
import { isValidBytes } from "~/data-types/uuid";

export type UuidSource = Uint8Array;

export default class Uuid {
  protected _bytes: Uint8Array;

  constructor(value: UuidSource) {
    defineAsUuid(this);

    if (!(value instanceof Uint8Array)) {
      throw new SurrealTypeError("Uint8Array", typeof value);
    }

    if (!isValidBytes(value)) {
      throw new SurrealTypeError("a valid uuid", `[${Array.from(value)}]`);
    }

    this._bytes = value;
  }

  get bytes(): Uint8Array {
    return this._bytes;
  }
}
