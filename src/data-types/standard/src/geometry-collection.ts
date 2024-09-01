import {
  type GeoJsonCollection,
  GeometryCollectionBase as Base,
  type GeometryCollectionSource as GeometryCollectionSourceBase,
  type GeometryCollectionTypes as GeometryCollectionTypesBase,
} from "@tai-kun/surrealdb/data-types/encodable";
import { type Coord, isGeometryCollection } from "../../_internals/geometry";
import {
  GeometryLine,
  type GeometryLineBase,
  type GeometryLineTypes,
} from "./geometry-line";
import {
  GeometryMultiLine,
  type GeometryMultiLineBase,
  type GeometryMultiLineTypes,
} from "./geometry-multiline";
import {
  GeometryMultiPoint,
  type GeometryMultiPointBase,
  type GeometryMultiPointTypes,
} from "./geometry-multipoint";
import {
  GeometryMultiPolygon,
  type GeometryMultiPolygonBase,
  type GeometryMultiPolygonTypes,
} from "./geometry-multipolygon";
import {
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";
import {
  GeometryPolygon,
  type GeometryPolygonBase,
  type GeometryPolygonTypes,
} from "./geometry-polygon";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

type MultiPointBase = new(
  source: any,
) => GeometryMultiPointBase<GeometryMultiPointTypes<PointBase>>;

type LineBase = new(
  source: any,
) => GeometryLineBase<GeometryLineTypes<PointBase>>;

type MultiLineBase = new(
  source: any,
) => GeometryMultiLineBase<GeometryMultiLineTypes<LineBase>>;

type PolygonBase = new(
  source: any,
) => GeometryPolygonBase<GeometryPolygonTypes<LineBase>>;

type MultiPolygonBase = new(
  source: any,
) => GeometryMultiPolygonBase<GeometryMultiPolygonTypes<PolygonBase>>;

export type GeometryCollectionTypes<
  Pt extends PointBase = PointBase,
  MPt extends MultiPointBase = MultiPointBase,
  Li extends LineBase = LineBase,
  MLi extends MultiLineBase = MultiLineBase,
  Pg extends PolygonBase = PolygonBase,
  MPg extends MultiPolygonBase = MultiPolygonBase,
> = GeometryCollectionTypesBase<Pt, MPt, Li, MLi, Pg, MPg>;

export type GeometryCollectionSource<
  T extends GeometryCollectionTypes = GeometryCollectionTypes,
> = GeometryCollectionSourceBase<T>;

export type { GeoJsonCollection };

export class GeometryCollectionBase<
  T extends GeometryCollectionTypes = GeometryCollectionTypes,
> extends Base<T> {
  clone(): this {
    const This = this.constructor as typeof GeometryCollectionBase;

    return new This(this.collection.map(p => p.clone()), this.types) as this;
  }

  equals(other: unknown): boolean {
    return isGeometryCollection<
      GeometryCollectionBase<GeometryCollectionTypes>
    >(other)
      && other.collection.length === this.collection.length
      && other.collection.every((p, i) => this.collection[i]!.equals(p));
  }
}

export class GeometryCollection extends GeometryCollectionBase<
  GeometryCollectionTypes<
    typeof GeometryPoint,
    typeof GeometryMultiPoint,
    typeof GeometryLine,
    typeof GeometryMultiLine,
    typeof GeometryPolygon,
    typeof GeometryMultiPolygon
  >
> {
  static readonly Point = GeometryPoint;
  static readonly MultiPoint = GeometryMultiPoint;
  static readonly Line = GeometryLine;
  static readonly MultiLine = GeometryMultiLine;
  static readonly Polygon = GeometryPolygon;
  static readonly MultiPolygon = GeometryMultiPolygon;

  constructor(source: GeometryCollectionSource<typeof GeometryCollection>) {
    super(source, GeometryCollection);
  }
}
