export type * from "./escape";
export {
  BACKTICK,
  BACKTICK_ESC,
  BRACKET_ESC,
  BRACKETL,
  BRACKETR,
  DOUBLE,
  DOUBLE_ESC,
  escape,
  escapeIdent,
  escapeKey,
  escapeNormal,
  escapeNumeric,
  escapeRid,
  quoteStr,
  SINGLE,
} from "./escape";

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
