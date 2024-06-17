import DecimalJs from "decimal.js";
import DecimalClass from "./Decimal";

export type * from "./Client";
export { default as Client } from "./Client";

export type * from "./Datetime";
export { default as Datetime } from "./Datetime";

export const Decimal = DecimalClass;
export type Decimal = DecimalJs;

export type * from "./Duration";
export { default as Duration } from "./Duration";

export type * from "./GeometryCollection";
export { default as GeometryCollection } from "./GeometryCollection";

export type * from "./GeometryLine";
export { default as GeometryLine } from "./GeometryLine";

export type * from "./GeometryMultiLine";
export { default as GeometryMultiLine } from "./GeometryMultiLine";

export type * from "./GeometryMultiPoint";
export { default as GeometryMultiPoint } from "./GeometryMultiPoint";

export type * from "./GeometryMultiPolygon";
export { default as GeometryMultiPolygon } from "./GeometryMultiPolygon";

export type * from "./GeometryPoint";
export { default as GeometryPoint } from "./GeometryPoint";

export type * from "./GeometryPolygon";
export { default as GeometryPolygon } from "./GeometryPolygon";

export type * from "./Table";
export { default as Table } from "./Table";

export type * from "./Thing";
export { default as Thing } from "./Thing";

export type * from "./Uuid";
export { default as Uuid } from "./Uuid";

// re-exports

export type * from "../ClientAbc";
export { default as ClientAbc } from "../ClientAbc";
