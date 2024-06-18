import toSurql from "../../toSurql";
import createGeometryLine from "../createGeometryLine";
import type { SurqlValueSerializer } from "../Serializer";
import GeometryPoint from "./GeometryPoint";

export default class GeometryLine
  extends /* @__PURE__ */ createGeometryLine(GeometryPoint)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
