import isCustomClass from "~/_lib/isCustomClass";
import { unreachable } from "~/errors";
import {
  _defineAssertGeometryCollection,
  _defineAssertGeometryLine,
  _defineAssertGeometryMultiLine,
  _defineAssertGeometryMultiPoint,
  _defineAssertGeometryMultiPolygon,
  _defineAssertGeometryPoint,
  _defineAssertGeometryPolygon,
} from "./internal";

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

export abstract class GeometryAbc<T extends GeometryType> {
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
}
