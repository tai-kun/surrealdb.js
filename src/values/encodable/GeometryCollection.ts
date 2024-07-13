import toSurql from "~/index/toSurql";
import type { Coord, GeometryType } from "../_lib/geometry";
import type { Encodable } from "../_lib/types";
import { GeometryCollectionBase as Base } from "../decode-only/GeometryCollection";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
} from "./GeometryLine";
import {
  type GeoJsonMultiLine,
  GeometryMultiLine,
  type GeometryMultiLineBase,
} from "./GeometryMultiLine";
import {
  type GeoJsonMultiPoint,
  GeometryMultiPoint,
  type GeometryMultiPointBase,
} from "./GeometryMultiPoint";
import {
  type GeoJsonMultiPolygon,
  GeometryMultiPolygon,
  type GeometryMultiPolygonBase,
} from "./GeometryMultiPolygon";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
} from "./GeometryPoint";
import {
  type GeoJsonPolygon,
  GeometryPolygon,
  type GeometryPolygonBase,
} from "./GeometryPolygon";

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
  get geometries(): (
    | ReturnType<InstanceType<Pt>["structure"]>
    | ReturnType<InstanceType<MPt>["structure"]>
    | ReturnType<InstanceType<Li>["structure"]>
    | ReturnType<InstanceType<MLi>["structure"]>
    | ReturnType<InstanceType<Pg>["structure"]>
    | ReturnType<InstanceType<MPg>["structure"]>
  )[] {
    return this.collection.map((g): any =>
      g.structure() satisfies {
        type: GeometryType;
      }
    );
  }

  toJSON(): GeoJsonCollection {
    return {
      type: this.type,
      geometries: this.collection.map(p => p.toJSON()),
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      geometries: this.geometries,
    });
  }

  structure(): {
    type: "GeometryCollection";
    geometries: readonly (
      | ReturnType<InstanceType<Pt>["structure"]>
      | ReturnType<InstanceType<MPt>["structure"]>
      | ReturnType<InstanceType<Li>["structure"]>
      | ReturnType<InstanceType<MLi>["structure"]>
      | ReturnType<InstanceType<Pg>["structure"]>
      | ReturnType<InstanceType<MPg>["structure"]>
    )[];
  } {
    return {
      type: this.type,
      geometries: this.geometries,
    };
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
