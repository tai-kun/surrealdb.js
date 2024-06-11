import { _defineAssertGeometryPoint } from "../internal";
import Geometry from "./Geometry";

export default class GeometryPoint extends Geometry {
  constructor() {
    super();
    _defineAssertGeometryPoint(this);
  }
}
