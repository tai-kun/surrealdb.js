import DecimalJs from "decimal.js-light";
import DecimalClass from "./values/Decimal";

export type * from "./client/Client";
export { default as Client } from "./client/Client";

export type * from "./values/Datetime";
export { default as Datetime } from "./values/Datetime";

export const Decimal = DecimalClass;
export type Decimal = DecimalJs;

export type * from "./values/Duration";
export { default as Duration } from "./values/Duration";

export type * from "./values/gemetory/GeometryCollection";
export { default as GeometryCollection } from "./values/gemetory/GeometryCollection";

export type * from "./values/gemetory/GeometryLine";
export { default as GeometryLine } from "./values/gemetory/GeometryLine";

export type * from "./values/gemetory/GeometryMultiLine";
export { default as GeometryMultiLine } from "./values/gemetory/GeometryMultiLine";

export type * from "./values/gemetory/GeometryMultiPoint";
export { default as GeometryMultiPoint } from "./values/gemetory/GeometryMultiPoint";

export type * from "./values/gemetory/GeometryMultiPolygon";
export { default as GeometryMultiPolygon } from "./values/gemetory/GeometryMultiPolygon";

export type * from "./values/gemetory/GeometryPoint";
export { default as GeometryPoint } from "./values/gemetory/GeometryPoint";

export type * from "./values/gemetory/GeometryPolygon";
export { default as GeometryPolygon } from "./values/gemetory/GeometryPolygon";

export type * from "./values/Table";
export { default as Table } from "./values/Table";

export type * from "./values/Thing";
export { default as Thing } from "./values/Thing";

export type * from "./values/Uuid";
export { default as Uuid } from "./values/Uuid";

// re-exports

export type * from "../_client/Abc";
export { default as ClientAbc } from "../_client/Abc";
