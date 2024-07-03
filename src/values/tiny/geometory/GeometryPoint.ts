import createGeometryPoint from "../../_lib/geometry/createGeometryPoint";
import Decimal from "../Decimal";

export default class GeometryPoint
  extends /* @__PURE__ */ createGeometryPoint(Decimal)
{}
