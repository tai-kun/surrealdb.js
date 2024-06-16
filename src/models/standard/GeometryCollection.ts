import createGeometryCollection from "../createGeometryCollection";
import type GeometryLine from "./GeometryLine";
import type GeometryMultiLine from "./GeometryMultiLine";
import type GeometryMultiPoint from "./GeometryMultiPoint";
import type GeometryMultiPolygon from "./GeometryMultiPolygon";
import type GeometryPoint from "./GeometryPoint";
import type GeometryPolygon from "./GeometryPolygon";

export default /* @__PURE__ */ createGeometryCollection<
  typeof GeometryPoint,
  typeof GeometryLine,
  typeof GeometryPolygon,
  typeof GeometryMultiPoint,
  typeof GeometryMultiLine,
  typeof GeometryMultiPolygon
>();
