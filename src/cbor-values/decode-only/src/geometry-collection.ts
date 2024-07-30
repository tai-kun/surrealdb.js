import { defineAsGeometryCollection } from "~/cbor-values/define";
import type { Coord, Geometry } from "~/cbor-values/geometry";
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

export class GeometryCollectionBase<
  Pt extends new(arg: any) => Point,
  MPt extends new(arg: any) => MultiPoint,
  Li extends new(arg: any) => Line,
  MLi extends new(arg: any) => MultiLine,
  Pg extends new(arg: any) => Polygon,
  MPg extends new(arg: any) => MultiPolygon,
> implements Geometry {
  protected readonly _geo: {
    readonly Point: Pt;
    readonly MultiPoint: MPt;
    readonly Line: Li;
    readonly MultiLine: MLi;
    readonly Polygon: Pg;
    readonly MultiPolygon: MPg;
  };

  readonly type = "GeometryCollection" as const;

  readonly collection: readonly (
    | InstanceType<Pt>
    | InstanceType<MPt>
    | InstanceType<Li>
    | InstanceType<MLi>
    | InstanceType<Pg>
    | InstanceType<MPg>
  )[];

  constructor(
    geo: {
      readonly Point: Pt;
      readonly MultiPoint: MPt;
      readonly Line: Li;
      readonly MultiLine: MLi;
      readonly Polygon: Pg;
      readonly MultiPolygon: MPg;
    },
    collection:
      | readonly (
        | InstanceType<Li>
        | InstanceType<MLi>
        | InstanceType<Pt>
        | InstanceType<MPt>
        | InstanceType<Pg>
        | InstanceType<MPg>
      )[]
      | Readonly<
        Pick<GeometryCollectionBase<Pt, MPt, Li, MLi, Pg, MPg>, "collection">
      >,
  ) {
    this._geo = geo;
    this.collection = !Array.isArray(collection)
      ? [...collection.collection]
      : [...collection];
    defineAsGeometryCollection(this);
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
