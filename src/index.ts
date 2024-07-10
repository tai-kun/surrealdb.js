export type * from "./index/escape";
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
} from "./index/escape";

export type * from "./index/initSurreal";
export { default as initSurreal } from "./index/initSurreal";

export type * from "./index/toSurql";
export { default as toSurql } from "./index/toSurql";

export type * from "./index/types";

export {
  type Datetime,
  type DecimalType,
  type Duration,
  type GeometryCollectionType,
  type GeometryLineType,
  type GeometryMultiLineType,
  type GeometryMultiPointType,
  type GeometryMultiPolygonType,
  type GeometryPointType,
  type GeometryPolygonType,
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
  type TableType,
  type ThingType,
  type UuidType,
} from "./index/values";
