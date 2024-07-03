import toSurql from "~/index/toSurql";
import createGeometryPolygon from "../../_lib/geometry/createGeometryPolygon";
import type { SurqlValueSerializer } from "../../_lib/types";
import GeometryLine from "./GeometryLine";

export default class GeometryPolygon
  extends /* @__PURE__ */ createGeometryPolygon(GeometryLine)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
