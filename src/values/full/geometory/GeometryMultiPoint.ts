import toSurql from "~/index/toSurql";
import createGeometryMultiPoint from "../../_lib/geometry/createGeometryMultiPoint";
import type { SurqlValueSerializer } from "../../_lib/types";
import GeometryPoint from "./GeometryPoint";

export default class GeometryMultiPoint
  extends /* @__PURE__ */ createGeometryMultiPoint(GeometryPoint)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
