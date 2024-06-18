import toSurql from "../../toSurql";
import createGeometryPoint from "../createGeometryPoint";
import type { SurqlValueSerializer } from "../Serializer";
import Decimal from "./Decimal";

export default class GeometryPoint
  extends /* @__PURE__ */ createGeometryPoint(Decimal)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
