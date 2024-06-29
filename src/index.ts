export type * from "./common/escape";
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
} from "./common/escape";

export type * from "./common/initSurreal";
export { default as initSurreal } from "./common/initSurreal";

export type * from "./common/toSurql";
export { default as toSurql } from "./common/toSurql";

export type * from "./common/types";

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
} from "./common/values";
