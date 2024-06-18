import toSurql from "../../toSurql";
import createGeometryMultiPolygon from "../createGeometryMultiPolygon";
import type { SurqlValueSerializer } from "../Serializer";
import GeometryPolygon from "./GeometryPolygon";

export default class GeometryMultiPolygon
  extends /* @__PURE__ */ createGeometryMultiPolygon(GeometryPolygon)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
