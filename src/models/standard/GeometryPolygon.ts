import toSurql from "../../toSurql";
import createGeometryPolygon from "../createGeometryPolygon";
import type { SurqlValueSerializer } from "../Serializer";
import GeometryLine from "./GeometryLine";

export default class GeometryPolygon
  extends /* @__PURE__ */ createGeometryPolygon(GeometryLine)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
