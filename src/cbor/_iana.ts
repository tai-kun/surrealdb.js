// See: https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml

import Tagged from "./tagged";

const CONTINUE = Symbol.for("@tai-kun/surrealdb/cbor/continue"); // decorder.ts と同じ

// See: https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml
const TAG_DATETIME = 0;

export function ianaReplacer(value: unknown): unknown {
  switch (true) {
    case value instanceof Date:
      return new Tagged(TAG_DATETIME, value.toISOString());

    default:
      return CONTINUE;
  }
}

export function ianaReviver(t: Tagged): unknown {
  switch (t.tag) {
    case TAG_DATETIME:
      return new Date(t.value as string);

    default:
      return CONTINUE;
  }
}
