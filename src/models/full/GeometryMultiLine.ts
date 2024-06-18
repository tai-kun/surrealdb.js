import toSurql from "../../toSurql";
import createGeometryMultiLine from "../createGeometryMultiLine";
import type { SurqlValueSerializer } from "../Serializer";
import GeometryLine from "./GeometryLine";

export default class GeometryMultiLine
  extends /* @__PURE__ */ createGeometryMultiLine(GeometryLine)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
