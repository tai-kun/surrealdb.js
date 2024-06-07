import { _defineAssertThing, type AnyTable, escapeIdent } from "../utils";

/**
 * The generation of record IDs is not currently supported by the CBOR protocol.
 *
 * @see [CBOR to SurrealQL](https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/rpc/format/cbor/convert.rs#L191)
 * @see [SurrealQL to CBOR](https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/rpc/format/cbor/convert.rs#L392-L394)
 * @see https://github.com/surrealdb/surrealdb.js/pull/275
 */
// TODO(tai-kun): Investigate the details.
export type ThingIdPrimitive =
  | boolean
  | number
  | bigint // CBOR only
  // | "rand()"
  // | "ulid()"
  // | "uuid()"
  | (string & {})
  | { readonly toJSON: () => ThingId };

export type ThingIdObject = {
  readonly [key: string | number]: ThingId;
};

export type ThingIdArray = readonly ThingId[];

export type ThingId =
  | ThingIdPrimitive
  | ThingIdObject
  | ThingIdArray;

/**
 * A SurrealDB record ID.
 */
export class Thing {
  /**
   * Escapes a table name.
   *
   * @param tb - The table name to escape.
   * @returns The escaped table name.
   * @see https://github.com/surrealdb/surrealdb/blob/v1.5.0/core/src/sql/thing.rs
   */
  static escapeTb(tb: string | AnyTable): string {
    return escapeIdent(typeof tb === "string" ? tb : tb.name);
  }

  /**
   * Escapes a record ID.
   *
   * @param id - The record ID to escape.
   * @returns The escaped record ID.
   * @see https://github.com/surrealdb/surrealdb/blob/v1.5.0/core/src/sql/id.rs
   */
  static escapeId(id: ThingId): string {
    if (typeof id !== "string") {
      return JSON.stringify(id);
    }

    switch (id) {
      // case "rand()":
      // case "ulid()":
      // case "uuid()":
      //   return id;

      default:
        return escapeIdent(id);
    }
  }

  /**
   * @param tb - The table name.
   * @param id - The record ID.
   */
  constructor(public tb: string | AnyTable, public id: ThingId) {
    _defineAssertThing(this);
  }

  /**
   * Returns the string representation of the record ID.
   */
  toString(): `${string}:${string}` {
    return `${Thing.escapeTb(this.tb)}:${Thing.escapeId(this.id)}`;
  }

  /**
   * Returns the JSON representation of the record ID.
   * This is the same as `toString`.
   */
  toJSON(): `${string}:${string}` {
    return this.toString();
  }
}
