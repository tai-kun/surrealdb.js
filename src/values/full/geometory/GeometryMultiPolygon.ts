import toSurql from "~/index/toSurql";
import createGeometryMultiPolygon from "../../_lib/geometry/createGeometryMultiPolygon";
import type { SurqlValueSerializer } from "../../_lib/Serializer";
import GeometryPolygon from "./GeometryPolygon";

export default class GeometryMultiPolygon
  extends /* @__PURE__ */ createGeometryMultiPolygon(GeometryPolygon)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
