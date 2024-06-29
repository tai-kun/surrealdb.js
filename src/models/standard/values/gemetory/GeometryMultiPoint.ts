import toSurql from "~/common/toSurql";
import createGeometryMultiPoint from "../../../_values/geometry/createGeometryMultiPoint";
import type { SurqlValueSerializer } from "../../../_values/Serializer";
import GeometryPoint from "./GeometryPoint";

export default class GeometryMultiPoint
  extends /* @__PURE__ */ createGeometryMultiPoint(GeometryPoint)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
