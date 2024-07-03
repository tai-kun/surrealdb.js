import toSurql from "~/index/toSurql";
import createGeometryPoint from "../../_lib/geometry/createGeometryPoint";
import type { SurqlValueSerializer } from "../../_lib/Serializer";
import Decimal from "../Decimal";

export default class GeometryPoint
  extends /* @__PURE__ */ createGeometryPoint(Decimal)
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
