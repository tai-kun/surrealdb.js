export type * from "./escape";
export { default as escape } from "./escape";

export type * from "./escapeIdent";
export { default as escapeIdent } from "./escapeIdent";

export type * from "./escapeNumeric";
export { default as escapeNumeric } from "./escapeNumeric";

export type * from "./escapeRid";
export { default as escapeRid } from "./escapeRid";

export type * from "./initSurreal";
export { default as initSurreal } from "./initSurreal";

export type * from "./toSurql";
export { default as toSurql } from "./toSurql";

export type * from "./types";

export {
  type DatetimeAny,
  type DecimalAny,
  type DurationAny,
  type GeometryCollectionAny,
  type GeometryLineAny,
  type GeometryMultiLineAny,
  type GeometryMultiPointAny,
  type GeometryMultiPolygonAny,
  type GeometryPointAny,
  type GeometryPolygonAny,
  isDatetime,
  isDecimal,
  isDuration,
  isGeometryCollection,
  isGeometryLine,
  isGeometryMultiLine,
  isGeometryMultiPoint,
  isGeometryMultiPolygon,
  isGeometryPoint,
  isGeometryPolygon,
  isTable,
  isThing,
  isUuid,
  type TableAny,
  type ThingAny,
  type UuidAny,
} from "./values";
