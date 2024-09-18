import { defineAsGeometryCollection } from "../_internals/define";
import type { Coord, Geometry } from "../_internals/geometry";
import {
  GeometryLine,
  type GeometryLineBase,
  GeometryLineTypes,
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
> = {
  readonly Point: TPoint;
  readonly MultiPoint: TMultiPoint;
  readonly Line: TLine;
  readonly MultiLine: TMultiLine;
  readonly Polygon: TPolygon;
  readonly MultiPolygon: TMultiPolygon;
};

export type GeometryCollectionSource<
  TTypes extends GeometryCollectionTypes = GeometryCollectionTypes,
> = readonly (
  | InstanceType<TTypes["Point"]>
  | InstanceType<TTypes["MultiPoint"]>
  | InstanceType<TTypes["Line"]>
  | InstanceType<TTypes["MultiLine"]>
  | InstanceType<TTypes["Polygon"]>
  | InstanceType<TTypes["MultiPolygon"]>
)[];

export class GeometryCollectionBase<TTypes extends GeometryCollectionTypes>
  implements Geometry
{
  readonly type = "GeometryCollection" as const;

  readonly collection: readonly (
    | InstanceType<TTypes["Point"]>
    | InstanceType<TTypes["MultiPoint"]>
    | InstanceType<TTypes["Line"]>
    | InstanceType<TTypes["MultiLine"]>
    | InstanceType<TTypes["Polygon"]>
    | InstanceType<TTypes["MultiPolygon"]>
  )[];

  constructor(
    collection: GeometryCollectionSource<TTypes>,
    readonly types: TTypes,
  ) {
    this.collection = collection.slice();
    defineAsGeometryCollection(this);
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
