import type { Coord } from "../../_shared/Geometry";
import { GeometryCollectionBase as Base } from "../../standard/src/GeometryCollection";
import { GeometryLine, type GeometryLineBase } from "./GeometryLine";
import {
  GeometryMultiLine,
  type GeometryMultiLineBase,
} from "./GeometryMultiLine";
import {
  GeometryMultiPoint,
  type GeometryMultiPointBase,
} from "./GeometryMultiPoint";
import {
  GeometryMultiPolygon,
  type GeometryMultiPolygonBase,
} from "./GeometryMultiPolygon";
import { GeometryPoint, type GeometryPointBase } from "./GeometryPoint";
import { GeometryPolygon, type GeometryPolygonBase } from "./GeometryPolygon";

export type * from "../../standard/src/GeometryCollection";

type Point = GeometryPointBase<Coord>;
type MultiPoint = GeometryMultiPointBase<new(_: any) => any>;
type Line = GeometryLineBase<new(_: any) => any>;
type MultiLine = GeometryMultiLineBase<new(_: any) => any>;
type Polygon = GeometryPolygonBase<new(_: any) => any>;
type MultiPolygon = GeometryMultiPolygonBase<new(_: any) => any>;

export class GeometryCollectionBase<
  Pt extends new(arg: any) => Point,
  MPt extends new(arg: any) => MultiPoint,
  Li extends new(arg: any) => Line,
  MLi extends new(arg: any) => MultiLine,
  Pg extends new(arg: any) => Polygon,
  MPg extends new(arg: any) => MultiPolygon,
> extends Base<Pt, MPt, Li, MLi, Pg, MPg> {
  clone(): this {
    // @ts-expect-error
    return new this.constructor({
      collection: this.collection.map(p => p.clone()),
    });
  }

  equal(other: unknown): boolean {
    return other instanceof GeometryCollectionBase
      && other.collection.length === this.collection.length
      && other.collection.every((p, i) => this.collection[i]!.equal(p));
  }
}

export class GeometryCollection extends GeometryCollectionBase<
  typeof GeometryPoint,
  typeof GeometryMultiPoint,
  typeof GeometryLine,
  typeof GeometryMultiLine,
  typeof GeometryPolygon,
  typeof GeometryMultiPolygon
> {
  static readonly Point = GeometryPoint;
  static readonly MultiPoint = GeometryMultiPoint;
  static readonly Line = GeometryLine;
  static readonly MultiLine = GeometryMultiLine;
  static readonly Polygon = GeometryPolygon;
  static readonly MultiPolygon = GeometryMultiPolygon;

  constructor(
    collection:
      | readonly (
        | GeometryPoint
        | GeometryMultiPoint
        | GeometryLine
        | GeometryMultiLine
        | GeometryPolygon
        | GeometryMultiPolygon
      )[]
      | Readonly<Pick<GeometryCollection, "collection">>,
  ) {
    super(GeometryCollection, collection);
  }
}
