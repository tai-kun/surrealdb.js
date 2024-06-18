import toSurql from "../../toSurql";
import createGeometryMultiPoint from "../createGeometryMultiPoint";
import type { SurqlValueSerializer } from "../Serializer";
import GeometryPoint from "./GeometryPoint";

export default class GeometryMultiPoint
  extends /* @__PURE__ */ createGeometryMultiPoint(GeometryPoint)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
