import { _defineAssertGeometryPolygon } from "../internal";
import Geometry from "./Geometry";

export default class GeometryPolygon extends Geometry {
  constructor() {
    super();
    _defineAssertGeometryPolygon(this);
  }
}
