import toSurql from "~/index/toSurql";
import createGeometryLine from "../../_lib/geometry/createGeometryLine";
import type { SurqlValueSerializer } from "../../_lib/types";
import GeometryPoint from "./GeometryPoint";

export default class GeometryLine
  extends /* @__PURE__ */ createGeometryLine(GeometryPoint)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
