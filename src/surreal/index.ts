export {
  type DataType,
  dataTypeOf,
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
} from "./src/data-types";

export {
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Surreal,
  Table,
  Thing,
  Uuid,
} from "./src/default";

export type * from "./src/init-surreal";
export { default as initSurreal } from "./src/init-surreal";

export type * from "@tai-kun/surrealdb/types";
