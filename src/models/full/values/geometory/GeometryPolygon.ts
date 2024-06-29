import toSurql from "../../../../common/toSurql";
import createGeometryPolygon from "../../../_values/geometry/createGeometryPolygon";
import type { SurqlValueSerializer } from "../../../_values/Serializer";
import GeometryLine from "./GeometryLine";

export default class GeometryPolygon
  extends /* @__PURE__ */ createGeometryPolygon(GeometryLine)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
