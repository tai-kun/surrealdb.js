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
  type Decimal,
  type Duration,
  type GeometryCollection,
  type GeometryLine,
  type GeometryMultiLine,
  type GeometryMultiPoint,
  type GeometryMultiPolygon,
  type GeometryPoint,
  type GeometryPolygon,
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
  type Table,
  type Thing,
  type Uuid,
} from "./index/values";
