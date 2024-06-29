import toSurql from "../../../../common/toSurql";
import createGeometryMultiLine from "../../../_values/geometry/createGeometryMultiLine";
import type { SurqlValueSerializer } from "../../../_values/Serializer";
import GeometryLine from "./GeometryLine";

export default class GeometryMultiLine
  extends /* @__PURE__ */ createGeometryMultiLine(GeometryLine)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
