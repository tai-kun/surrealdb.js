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
  type DatetimeType,
  type DecimalType,
  type DurationType,
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
} from "./common/values";
