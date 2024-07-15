// main exports

import DecimalJs from "decimal.js";
import DecimalClass from "./src/Decimal";

export type * from "./src/Datetime";
export { default as Datetime } from "./src/Datetime";

export const Decimal = DecimalClass;
export type Decimal = DecimalJs;

export type * from "./src/Duration";
export { default as Duration } from "./src/Duration";

export type * from "./src/GeometryCollection";
export {
  GeometryCollection,
  GeometryCollectionBase,
} from "./src/GeometryCollection";

export { GeometryLine, GeometryLineBase } from "./src/GeometryLine";

export type * from "./src/GeometryMultiLine";
export {
  GeometryMultiLine,
  GeometryMultiLineBase,
} from "./src/GeometryMultiLine";

export type * from "./src/GeometryMultiPoint";
export {
  GeometryMultiPoint,
  GeometryMultiPointBase,
} from "./src/GeometryMultiPoint";

export type * from "./src/GeometryMultiPolygon";
export {
  GeometryMultiPolygon,
  GeometryMultiPolygonBase,
} from "./src/GeometryMultiPolygon";

export { GeometryPoint, GeometryPointBase } from "./src/GeometryPoint";

export { GeometryPolygon, GeometryPolygonBase } from "./src/GeometryPolygon";

export type * from "./src/Table";
export { default as Table } from "./src/Table";

export type * from "./src/Thing";
export { default as Thing } from "./src/Thing";

export type * from "./src/Uuid";
export { default as Uuid } from "./src/Uuid";

// lib exports

export type * from "../_shared/Geometry";
export { default as GeometryAbc } from "../_shared/Geometry";

export type * from "../_shared/types";
