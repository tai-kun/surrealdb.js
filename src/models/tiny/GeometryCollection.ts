import { _defineAssertGeometryCollection } from "../internal";
import Geometry from "./Geometry";

export default class GeometryCollection extends Geometry {
  constructor() {
    super();
    _defineAssertGeometryCollection(this);
  }
}
