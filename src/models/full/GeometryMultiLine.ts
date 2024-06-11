import { _defineAssertGeometryMultiLine } from "../internal";
import Geometry from "./Geometry";

export default class GeometryMultiLine extends Geometry {
  constructor() {
    super();
    _defineAssertGeometryMultiLine(this);
  }
}
