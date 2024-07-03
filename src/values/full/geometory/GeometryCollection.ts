import toSurql from "~/index/toSurql";
import createGeometryCollection from "../../_lib/geometry/createGeometryCollection";
import type { SurqlValueSerializer } from "../../_lib/Serializer";
import type GeometryLine from "./GeometryLine";
import type GeometryMultiLine from "./GeometryMultiLine";
import type GeometryMultiPoint from "./GeometryMultiPoint";
import type GeometryMultiPolygon from "./GeometryMultiPolygon";
import type GeometryPoint from "./GeometryPoint";
import type GeometryPolygon from "./GeometryPolygon";

type Geometry =
  | GeometryPoint
  | GeometryLine
  | GeometryPolygon
  | GeometryMultiPoint
  | GeometryMultiLine
  | GeometryMultiPolygon;

export default class GeometryCollection<
  T extends readonly [Geometry, ...Geometry[]] = [Geometry, ...Geometry[]],
> extends /* @__PURE__ */ createGeometryCollection<Geometry>()<T>
  implements SurqlValueSerializer
{
  toSurql(): string {
    return toSurql(this.toJSON());
  }
}
