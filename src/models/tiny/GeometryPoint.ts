import createGeometryPoint from "../createGeometryPoint";
import Decimal from "./Decimal";

export default class GeometryPoint
  extends /* @__PURE__ */ createGeometryPoint(Decimal)
{}
