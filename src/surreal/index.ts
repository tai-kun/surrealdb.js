export type * from "./src/auto-reconnect";
export { default as autoReconnect } from "./src/auto-reconnect";

export type * from "./src/create-query";
export { default as createQuery } from "./src/create-query";

export type * from "./src/create-rpc";
export { default as createRpc } from "./src/create-rpc";

export type * from "./src/create-surql";
export { default as createSurql } from "./src/create-surql";

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
  surql,
  Surreal,
  Table,
  Thing,
  Uuid,
} from "./src/default";

export type * from "./src/init-surreal";
export { default as initSurreal } from "./src/init-surreal";

export type * from "./src/prepared-query";
export { default as PreparedQuery } from "./src/prepared-query";

export type * from "./src/query";
export { default as query } from "./src/query";

export type * from "./src/rpc";
export { default as rpc } from "./src/rpc";

export type * from "./src/slot";
export { default as Slot } from "./src/slot";

export type * from "@tai-kun/surrealdb/types";
