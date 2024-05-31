import { _defineAssertThing } from "../utils";

/**
 * Escapes a record ID.
 *
 * @param rid - The record ID to escape.
 * @returns The escaped record ID.
 * @see https://github.com/surrealdb/surrealdb/blob/v1.5.0/core/src/sql/escape.rs
 * @see https://github.com/surrealdb/surrealdb.js/blob/v1.0.0-beta.8/src/library/cbor/recordid.ts
 */
export function escapeRid(rid: string): string {
  let code: number | undefined, char: string;

  for (char of rid) {
    if (
      !(code = char.codePointAt(0))
      || (
        !(code > 47 && code < 58) // numeric (0-9)
        && !(code > 64 && code < 91) // upper alpha (A-Z)
        && !(code > 96 && code < 123) // lower alpha (a-z)
        && !(code == 95) // underscore (_)
      )
    ) {
      return `⟨${rid.replaceAll("⟩", "\⟩")}⟩`;
    }
  }

  return rid;
}

// TODO(tai-kun): Investigate the details.
export type ThingIdPrimitive =
  | boolean
  | number
  | bigint // CBOR only
  | "rand()"
  | "ulid()"
  | "uuid()"
  | (string & {})
  | { readonly toJSON: () => string };

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
  static escapeTb(tb: string): string {
    return escapeRid(tb);
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
      case "rand()":
      case "ulid()":
      case "uuid()":
        return id;

      default:
        return escapeRid(id);
    }
  }

  /**
   * @param tb - The table name.
   * @param id - The record ID.
   */
  constructor(public tb: string, public id: ThingId) {
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
