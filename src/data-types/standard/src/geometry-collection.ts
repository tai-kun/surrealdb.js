import { GeometryCollectionBase as Base } from "@tai-kun/surrealdb/data-types/encodable";
import { type Coord, isGeometryCollection } from "~/data-types/geometry";
import { GeometryLine, type GeometryLineBase } from "./geometry-line";
import {
  GeometryMultiLine,
  type GeometryMultiLineBase,
} from "./geometry-multiline";
import {
  GeometryMultiPoint,
  type GeometryMultiPointBase,
} from "./geometry-multipoint";
import {
  GeometryMultiPolygon,
  type GeometryMultiPolygonBase,
} from "./geometry-multipolygon";
import { GeometryPoint, type GeometryPointBase } from "./geometry-point";
import { GeometryPolygon, type GeometryPolygonBase } from "./geometry-polygon";

type Point = GeometryPointBase<Coord>;
type MultiPoint = GeometryMultiPointBase<new(_: any) => any>;
type Line = GeometryLineBase<new(_: any) => any>;
type MultiLine = GeometryMultiLineBase<new(_: any) => any>;
type Polygon = GeometryPolygonBase<new(_: any) => any>;
type MultiPolygon = GeometryMultiPolygonBase<new(_: any) => any>;

export type { GeoJsonCollection } from "@tai-kun/surrealdb/data-types/encodable";

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
    return new this.constructor(this._geo, {
      collection: this.collection.map(p => p.clone()),
    });
  }

  equals(other: unknown): boolean {
    return isGeometryCollection<
      GeometryCollectionBase<Pt, MPt, Li, MLi, Pg, MPg>
    >(other)
      && other.collection.length === this.collection.length
      && other.collection.every((p, i) => this.collection[i]!.equals(p));
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

  override clone(): this {
    // @ts-expect-error
    return new this.constructor({
      collection: this.collection.map(p => p.clone()),
    });
  }
}
