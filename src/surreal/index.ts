export type * from "./src/inline/create-query";
export { default as createQuery } from "./src/inline/create-query";

export type * from "./src/inline/create-rpc";
export { default as createRpc } from "./src/inline/create-rpc";

export type * from "./src/inline/query";
export { default as query } from "./src/inline/query";

export type * from "./src/inline/rpc";
export { default as rpc } from "./src/inline/rpc";

export type * from "./src/surql/create-surql";
export { default as createSurql } from "./src/surql/create-surql";

export type * from "./src/surql/init-surreal";
export { default as initSurreal } from "./src/surql/init-surreal";

export type * from "./src/surql/prepared-query";
export { default as PreparedQuery } from "./src/surql/prepared-query";

export type * from "./src/surql/raw";
export { default as Raw } from "./src/surql/raw";

export type * from "./src/surql/slot";
export { default as Slot } from "./src/surql/slot";

export type * from "./src/utils/auto-reconnect";
export { default as autoReconnect } from "./src/utils/auto-reconnect";

export {
  type DataType,
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

export type * from "@tai-kun/surrealdb/types";
