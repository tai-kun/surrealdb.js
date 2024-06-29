import toSurql from "~/common/toSurql";
import createGeometryLine from "../../../_values/geometry/createGeometryLine";
import type { SurqlValueSerializer } from "../../../_values/Serializer";
import GeometryPoint from "./GeometryPoint";

export default class GeometryLine
  extends /* @__PURE__ */ createGeometryLine(GeometryPoint)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
