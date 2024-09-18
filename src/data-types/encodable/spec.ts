import type { ToCBOR } from "@tai-kun/surrealdb/cbor";
import type { ToJSON, ToPlainObject, ToSurql } from "@tai-kun/surrealdb/utils";

export interface Encodable extends ToCBOR, ToJSON, ToPlainObject, ToSurql {}

// See: https://github.com/surrealdb/surrealdb/blob/v2.0.1/core/src/rpc/format/cbor/convert.rs
export const CBOR_TAG_NONE = 6 as const;
export const CBOR_TAG_TABLE = 7 as const;
export const CBOR_TAG_RECORDID = 8 as const;
export const CBOR_TAG_DECIMAL = 10 as const;
export const CBOR_TAG_DATETIME = 12 as const;
export const CBOR_TAG_DURATION = 14 as const;
export const CBOR_TAG_FUTURE = 15 as const;
export const CBOR_TAG_UUID = 37 as const;
export const CBOR_TAG_RANGE = 49 as const;
export const CBOR_TAG_BOUND_INCLUDED = 50 as const;
export const CBOR_TAG_BOUND_EXCLUDED = 51 as const;
export const CBOR_TAG_GEOMETRY_POINT = 88 as const;
export const CBOR_TAG_GEOMETRY_LINE = 89 as const;
export const CBOR_TAG_GEOMETRY_POLYGON = 90 as const;
export const CBOR_TAG_GEOMETRY_MULTIPOINT = 91 as const;
export const CBOR_TAG_GEOMETRY_MULTILINE = 92 as const;
export const CBOR_TAG_GEOMETRY_MULTIPOLYGON = 93 as const;
export const CBOR_TAG_GEOMETRY_COLLECTION = 94 as const;
