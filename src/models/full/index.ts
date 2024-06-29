import DecimalJs from "decimal.js";
import DecimalClass from "./values/Decimal";

export type * from "./client/Client";
export { default as Client } from "./client/Client";

export type * from "./values/Datetime";
export { default as Datetime } from "./values/Datetime";

export const Decimal = DecimalClass;
export type Decimal = DecimalJs;

export type * from "./values/Duration";
export { default as Duration } from "./values/Duration";

export type * from "./values/geometory/GeometryCollection";
export { default as GeometryCollection } from "./values/geometory/GeometryCollection";

export type * from "./values/geometory/GeometryLine";
export { default as GeometryLine } from "./values/geometory/GeometryLine";

export type * from "./values/geometory/GeometryMultiLine";
export { default as GeometryMultiLine } from "./values/geometory/GeometryMultiLine";

export type * from "./values/geometory/GeometryMultiPoint";
export { default as GeometryMultiPoint } from "./values/geometory/GeometryMultiPoint";

export type * from "./values/geometory/GeometryMultiPolygon";
export { default as GeometryMultiPolygon } from "./values/geometory/GeometryMultiPolygon";

export type * from "./values/geometory/GeometryPoint";
export { default as GeometryPoint } from "./values/geometory/GeometryPoint";

export type * from "./values/geometory/GeometryPolygon";
export { default as GeometryPolygon } from "./values/geometory/GeometryPolygon";

export type * from "./values/Table";
export { default as Table } from "./values/Table";

export type * from "./values/Thing";
export { default as Thing } from "./values/Thing";

export type * from "./values/Uuid";
export { default as Uuid } from "./values/Uuid";

// re-exports

export type * from "../_client/Abc";
export { default as ClientAbc } from "../_client/Abc";
