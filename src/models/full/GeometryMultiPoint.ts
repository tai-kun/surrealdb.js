import { _defineAssertGeometryMultiPoint } from "../internal";
import Geometry from "./Geometry";

export default class GeometryMultiPoint extends Geometry {
  constructor() {
    super();
    _defineAssertGeometryMultiPoint(this);
  }
}
