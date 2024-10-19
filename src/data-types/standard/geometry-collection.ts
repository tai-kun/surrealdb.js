import {
  type GeoJsonCollection,
  GeometryCollectionBase as Base,
  type GeometryCollectionSource as GeometryCollectionSourceBase,
  type GeometryCollectionTypes as GeometryCollectionTypesBase,
} from "@tai-kun/surrealdb/encodable-datatypes";
import { type Coord, isGeometryCollection } from "../_internals/geometry";
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
  TPoint extends PointBase = PointBase,
  TMultiPoint extends MultiPointBase = MultiPointBase,
  TLine extends LineBase = LineBase,
  TMultiLine extends MultiLineBase = MultiLineBase,
  TPolygon extends PolygonBase = PolygonBase,
  TMultiPolygon extends MultiPolygonBase = MultiPolygonBase,
> = GeometryCollectionTypesBase<
  TPoint,
  TMultiPoint,
  TLine,
  TMultiLine,
  TPolygon,
  TMultiPolygon
>;

export type GeometryCollectionSource<
  TTypes extends GeometryCollectionTypes = GeometryCollectionTypes,
> = GeometryCollectionSourceBase<TTypes>;

export type { GeoJsonCollection };

export class GeometryCollectionBase<
  TTypes extends GeometryCollectionTypes = GeometryCollectionTypes,
> extends Base<TTypes> {
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

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-collection)
 */
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
