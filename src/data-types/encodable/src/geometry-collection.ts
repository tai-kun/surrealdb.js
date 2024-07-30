import { GeometryCollectionBase as Base } from "@tai-kun/surreal/data-types/decode-only";
import { toSurql } from "@tai-kun/surreal/utils";
import type { Coord } from "~/data-types/geometry";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
} from "./geometry-line";
import {
  type GeoJsonMultiLine,
  GeometryMultiLine,
  type GeometryMultiLineBase,
} from "./geometry-multiline";
import {
  type GeoJsonMultiPoint,
  GeometryMultiPoint,
  type GeometryMultiPointBase,
} from "./geometry-multipoint";
import {
  type GeoJsonMultiPolygon,
  GeometryMultiPolygon,
  type GeometryMultiPolygonBase,
} from "./geometry-multipolygon";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
} from "./geometry-point";
import {
  type GeoJsonPolygon,
  GeometryPolygon,
  type GeometryPolygonBase,
} from "./geometry-polygon";
import { type Encodable, TAG_GEOMETRY_COLLECTION } from "./spec";

export type GeoJsonCollection = {
  type: "GeometryCollection";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.8
  // The value of "geometries" is an array.
  // Each element of this array is a GeoJSON Geometry object.
  // It is possible for this array to be empty.
  geometries: (
    | GeoJsonPoint
    | GeoJsonMultiPoint
    | GeoJsonLineString
    | GeoJsonMultiLine
    | GeoJsonPolygon
    | GeoJsonMultiPolygon
  )[];
};

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
> extends Base<Pt, MPt, Li, MLi, Pg, MPg> implements Encodable {
  get geometries(): GeoJsonCollection["geometries"] {
    return this.collection.map(p => p.toJSON());
  }

  toCBOR(): [tag: typeof TAG_GEOMETRY_COLLECTION, value: this["collection"]] {
    return [TAG_GEOMETRY_COLLECTION, this.collection];
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
