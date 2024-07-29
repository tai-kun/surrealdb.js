import type { ToCBOR } from "@tai-kun/surreal/cbor";
import type { Jsonifiable } from "@tai-kun/surreal/utils";

export interface Encodable extends ToCBOR {
  toJSON(): Jsonifiable;
  toSurql(): string;
  // toPlainObject(): Record<string, unknown>;
}

// See: https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml
export const TAG_SPEC_DATETIME = 0; // decode
export const TAG_SPEC_UUID = 37; // encode / decode

// SurrealDB Custom Tags
export const TAG_NONE = 6 as const; // encode / decode
export const TAG_TABLE = 7 as const; // encode / decode
export const TAG_RECORDID = 8 as const; // encode / decode
export const TAG_STRING_UUID = 9 as const; // decode
export const TAG_STRING_DECIMAL = 10 as const; // encode / decode
export const TAG_CUSTOM_DATETIME = 12 as const; // encode / decode
export const TAG_STRING_DURATION = 13 as const; // decode
export const TAG_CUSTOM_DURATION = 14 as const; // encode / decode
export const TAG_GEOMETRY_POINT = 88 as const; // encode / decode
export const TAG_GEOMETRY_LINE = 89 as const; // encode / decode
export const TAG_GEOMETRY_POLYGON = 90 as const; // encode / decode
export const TAG_GEOMETRY_MULTIPOINT = 91 as const; // encode / decode
export const TAG_GEOMETRY_MULTILINE = 92 as const; // encode / decode
export const TAG_GEOMETRY_MULTIPOLYGON = 93 as const; // encode / decode
export const TAG_GEOMETRY_COLLECTION = 94 as const; // encode / decode
