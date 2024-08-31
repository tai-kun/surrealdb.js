import { defineAsGeometryCollection } from "~/data-types/define";
import type { Coord, Geometry } from "~/data-types/geometry";
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
  Pt extends PointBase = PointBase,
  MPt extends MultiPointBase = MultiPointBase,
  Li extends LineBase = LineBase,
  MLi extends MultiLineBase = MultiLineBase,
  Pg extends PolygonBase = PolygonBase,
  MPg extends MultiPolygonBase = MultiPolygonBase,
> = {
  readonly Point: Pt;
  readonly MultiPoint: MPt;
  readonly Line: Li;
  readonly MultiLine: MLi;
  readonly Polygon: Pg;
  readonly MultiPolygon: MPg;
};

export type GeometryCollectionSource<
  T extends GeometryCollectionTypes = GeometryCollectionTypes,
> = readonly (
  | InstanceType<T["Point"]>
  | InstanceType<T["MultiPoint"]>
  | InstanceType<T["Line"]>
  | InstanceType<T["MultiLine"]>
  | InstanceType<T["Polygon"]>
  | InstanceType<T["MultiPolygon"]>
)[];

export class GeometryCollectionBase<T extends GeometryCollectionTypes>
  implements Geometry
{
  readonly type = "GeometryCollection" as const;

  readonly collection: readonly (
    | InstanceType<T["Point"]>
    | InstanceType<T["MultiPoint"]>
    | InstanceType<T["Line"]>
    | InstanceType<T["MultiLine"]>
    | InstanceType<T["Polygon"]>
    | InstanceType<T["MultiPolygon"]>
  )[];

  constructor(collection: GeometryCollectionSource<T>, readonly types: T) {
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
