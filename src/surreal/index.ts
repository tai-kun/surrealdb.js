export type * from "./inline/create-query";
export { default as createQuery } from "./inline/create-query";

export type * from "./inline/create-rpc";
export { default as createRpc } from "./inline/create-rpc";

export type * from "./inline/query";
export { default as query } from "./inline/query";

export type * from "./inline/rpc";
export { default as rpc } from "./inline/rpc";

export type * from "./surql/create-surql";
export { default as createSurql } from "./surql/create-surql";

export type * from "./surql/init-surreal";
export { default as initSurreal } from "./surql/init-surreal";

export type * from "./surql/prepared-query";
export { default as PreparedQuery } from "./surql/prepared-query";

export type * from "./surql/raw";
export { default as Raw } from "./surql/raw";

export type * from "./surql/slot";
export { default as Slot } from "./surql/slot";

export type * from "./utils/auto-reconnect";
export { default as autoReconnect } from "./utils/auto-reconnect";

export type * from "./utils/types";

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
} from "./data-types";

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
} from "./default";

export type * from "@tai-kun/surrealdb/types";
