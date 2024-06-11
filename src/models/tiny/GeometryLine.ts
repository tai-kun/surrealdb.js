import { _defineAssertGeometryLine } from "../internal";
import Geometry from "./Geometry";

export default class GeometryLine extends Geometry {
  constructor() {
    super();
    _defineAssertGeometryLine(this);
  }
}
