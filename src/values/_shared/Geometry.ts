import { unreachable } from "@tai-kun/surreal/errors";
import { isCustomClass } from "@tai-kun/surreal/utils";
import {
  _defineAsGeometryCollection,
  _defineAsGeometryLine,
  _defineAsGeometryMultiLine,
  _defineAsGeometryMultiPoint,
  _defineAsGeometryMultiPolygon,
  _defineAsGeometryPoint,
  _defineAsGeometryPolygon,
} from "./define";

// dprint-ignore
export type Coord =
  | (   (arg: any) => any)
  | (new(arg: any) => any);

// dprint-ignore
export type CoordArg<T extends Coord>
  // 関数は返す値を引数で受け入れることができるようにしなければならない。
  = T extends    (arg: infer A) => infer B ? (B extends A ? A : never)
  : T extends new(arg: infer A) =>     any ? A
  : never;

// dprint-ignore
export type CoordValue<T extends Coord>
  // 関数は返す値を引数で受け入れることができるようにしなければならない。
  = T extends    (arg: infer A) => infer B ? (B extends A ? B : never)
  : T extends new(arg:     any) => infer B ? B
  : never;

export function coord<T extends Coord>(
  Coord: T,
  argOrValue: CoordArg<T> | CoordValue<T>,
): CoordValue<T> {
  return isCustomClass(Coord)
    // @ts-expect-error
    ? argOrValue instanceof Coord
      ? argOrValue
      : new Coord(argOrValue)
    : Coord(argOrValue);
}

// https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/geometry.rs#L67-L78
export type GeometryType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon"
  | "GeometryCollection";

export default abstract class GeometryAbc<T extends GeometryType> {
  readonly #type: T;

  constructor(type: T) {
    this.#type = type;
    const t = type as GeometryType;

    switch (t) {
      case "Point":
        _defineAsGeometryPoint(this);
        break;
      case "LineString":
        _defineAsGeometryLine(this);
        break;
      case "Polygon":
        _defineAsGeometryPolygon(this);
        break;
      case "MultiPoint":
        _defineAsGeometryMultiPoint(this);
        break;
      case "MultiLineString":
        _defineAsGeometryMultiLine(this);
        break;
      case "MultiPolygon":
        _defineAsGeometryMultiPolygon(this);
        break;
      case "GeometryCollection":
        _defineAsGeometryCollection(this);
        break;
      default:
        unreachable(t);
    }
  }

  get type(): T {
    return this.#type;
  }
}
