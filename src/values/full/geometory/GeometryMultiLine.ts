import toSurql from "~/index/toSurql";
import createGeometryMultiLine from "../../_lib/geometry/createGeometryMultiLine";
import type { SurqlValueSerializer } from "../../_lib/Serializer";
import GeometryLine from "./GeometryLine";

export default class GeometryMultiLine
  extends /* @__PURE__ */ createGeometryMultiLine(GeometryLine)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
