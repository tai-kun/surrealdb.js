import type { Jsonifiable, Simplify } from "type-fest";
import { unreachable } from "../errors";
import {
  _defineAssertGeometryCollection,
  _defineAssertGeometryLine,
  _defineAssertGeometryMultiLine,
  _defineAssertGeometryMultiPoint,
  _defineAssertGeometryMultiPolygon,
  _defineAssertGeometryPoint,
  _defineAssertGeometryPolygon,
} from "./internal";

// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/geometry.rs#L67-L78
type GeometryType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon"
  | "GeometryCollection";

export default abstract class GeometryAbc<
  T extends GeometryType,
  U extends { readonly [_ in string | number]: Jsonifiable },
> {
  readonly #type: T;

  constructor(type: T) {
    this.#type = type;
    const t = type as GeometryType;

    switch (t) {
      case "Point":
        _defineAssertGeometryPoint(this);
        break;
      case "LineString":
        _defineAssertGeometryLine(this);
        break;
      case "Polygon":
        _defineAssertGeometryPolygon(this);
        break;
      case "MultiPoint":
        _defineAssertGeometryMultiPoint(this);
        break;
      case "MultiLineString":
        _defineAssertGeometryMultiLine(this);
        break;
      case "MultiPolygon":
        _defineAssertGeometryMultiPolygon(this);
        break;
      case "GeometryCollection":
        _defineAssertGeometryCollection(this);
        break;
      default:
        unreachable(t);
    }
  }

  get type(): T {
    return this.#type;
  }

  toJSON(): Simplify<{ type: T } & U> {
    return {
      ...this._toJSON(),
      type: this.#type,
    };
  }

  protected abstract _toJSON(): U;
}
