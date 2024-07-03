// main exports

import DecimalJs from "decimal.js";
import DecimalClass from "./Decimal";

export type * from "./Datetime";
export { default as Datetime } from "./Datetime";

export const Decimal = DecimalClass;
export type Decimal = DecimalJs;

export type * from "./Duration";
export { default as Duration } from "./Duration";

export type * from "./geometory/GeometryCollection";
export { default as GeometryCollection } from "./geometory/GeometryCollection";

export type * from "./geometory/GeometryLine";
export { default as GeometryLine } from "./geometory/GeometryLine";

export type * from "./geometory/GeometryMultiLine";
export { default as GeometryMultiLine } from "./geometory/GeometryMultiLine";

export type * from "./geometory/GeometryMultiPoint";
export { default as GeometryMultiPoint } from "./geometory/GeometryMultiPoint";

export type * from "./geometory/GeometryMultiPolygon";
export { default as GeometryMultiPolygon } from "./geometory/GeometryMultiPolygon";

export type * from "./geometory/GeometryPoint";
export { default as GeometryPoint } from "./geometory/GeometryPoint";

export type * from "./geometory/GeometryPolygon";
export { default as GeometryPolygon } from "./geometory/GeometryPolygon";

export type * from "./Table";
export { default as Table } from "./Table";

export type * from "./Thing";
export { default as Thing } from "./Thing";

export type * from "./Uuid";
export { default as Uuid } from "./Uuid";

// lib exports

export type * from "../_lib/geometry/Abc";
export { default as GeometryAbc } from "../_lib/geometry/Abc";

export type * from "../_lib/types";
