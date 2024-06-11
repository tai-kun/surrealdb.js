import { _defineAssertGeometryMultiPolygon } from "../internal";
import Geometry from "./Geometry";

export default class GeometryMultiPolygon extends Geometry {
  constructor() {
    super();
    _defineAssertGeometryMultiPolygon(this);
  }
}
