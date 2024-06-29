import createGeometryCollection from "../../../_values/geometry/createGeometryCollection";
import type GeometryLine from "./GeometryLine";
import type GeometryMultiLine from "./GeometryMultiLine";
import type GeometryMultiPoint from "./GeometryMultiPoint";
import type GeometryMultiPolygon from "./GeometryMultiPolygon";
import type GeometryPoint from "./GeometryPoint";
import type GeometryPolygon from "./GeometryPolygon";

type Geometry =
  | GeometryPoint
  | GeometryLine
  | GeometryPolygon
  | GeometryMultiPoint
  | GeometryMultiLine
  | GeometryMultiPolygon;

export default class GeometryCollection<
  T extends readonly [Geometry, ...Geometry[]] = [Geometry, ...Geometry[]],
> extends /* @__PURE__ */ createGeometryCollection<Geometry>()<T> {}
