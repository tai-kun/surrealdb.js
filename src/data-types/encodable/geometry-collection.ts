import {
  GeometryCollectionBase as Base,
  type GeometryCollectionSource as GeometryCollectionSourceBase,
  type GeometryCollectionTypes as GeometryCollectionTypesBase,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import type { Coord } from "../_internals/geometry";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
  type GeometryLineTypes,
} from "./geometry-line";
import {
  type GeoJsonMultiLineString,
  GeometryMultiLine,
  type GeometryMultiLineBase,
  type GeometryMultiLineTypes,
} from "./geometry-multiline";
import {
  type GeoJsonMultiPoint,
  GeometryMultiPoint,
  type GeometryMultiPointBase,
  type GeometryMultiPointTypes,
} from "./geometry-multipoint";
import {
  type GeoJsonMultiPolygon,
  GeometryMultiPolygon,
  type GeometryMultiPolygonBase,
  type GeometryMultiPolygonTypes,
} from "./geometry-multipolygon";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";
import {
  type GeoJsonPolygon,
  GeometryPolygon,
  type GeometryPolygonBase,
  type GeometryPolygonTypes,
} from "./geometry-polygon";
import { CBOR_TAG_GEOMETRY_COLLECTION, type Encodable } from "./spec";

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

export type GeoJsonCollection = {
  type: "GeometryCollection";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.8
  // > The value of "geometries" is an array. Each element of this array is
  // > a GeoJSON Geometry object. It is possible for this array to be empty.
  geometries: (
    | GeoJsonPoint
    | GeoJsonMultiPoint
    | GeoJsonLineString
    | GeoJsonMultiLineString
    | GeoJsonPolygon
    | GeoJsonMultiPolygon
  )[];
};

export class GeometryCollectionBase<
  T extends GeometryCollectionTypes = GeometryCollectionTypes,
> extends Base<T> implements Encodable {
  get geometries(): GeoJsonCollection["geometries"] {
    return this.collection.map(p => p.toJSON());
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_GEOMETRY_COLLECTION,
    value: this["collection"],
  ] {
    return [CBOR_TAG_GEOMETRY_COLLECTION, this.collection];
  }

  toJSON(): GeoJsonCollection {
    return {
      type: this.type,
      geometries: this.geometries,
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      geometries: this.collection,
    });
  }

  toPlainObject() {
    return {
      type: this.type,
      collection: this.collection,
    };
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
