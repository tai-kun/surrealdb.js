import { defineAsGeometryMultiPolygon } from "~/data-types/define";
import { type Coord, type Geometry, map } from "~/data-types/geometry";
import type { GeometryLineBase, GeometryLineTypes } from "./geometry-line";
import type { GeometryPointBase, GeometryPointTypes } from "./geometry-point";
import {
  GeometryPolygon,
  type GeometryPolygonBase,
  type GeometryPolygonTypes,
} from "./geometry-polygon";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

type LineBase = new(
  source: any,
) => GeometryLineBase<GeometryLineTypes<PointBase>>;

type PolygonBase = new(
  source: any,
) => GeometryPolygonBase<GeometryPolygonTypes<LineBase>>;

export type GeometryMultiPolygonTypes<P extends PolygonBase = PolygonBase> = {
  readonly Polygon: P;
};

export type GeometryMultiPolygonSource<
  T extends GeometryMultiPolygonTypes = GeometryMultiPolygonTypes,
> = readonly (
  | ConstructorParameters<T["Polygon"]>[0]
  | InstanceType<T["Polygon"]>
)[];

export class GeometryMultiPolygonBase<
  T extends GeometryMultiPolygonTypes = GeometryMultiPolygonTypes,
> implements Geometry {
  readonly type = "MultiPolygon" as const;

  readonly polygons: readonly InstanceType<T["Polygon"]>[];

  constructor(source: GeometryMultiPolygonSource<T>, readonly types: T) {
    this.polygons = map(
      source,
      (p: any) =>
        (p instanceof types.Polygon
          ? p
          : new types.Polygon(p)) as InstanceType<T["Polygon"]>,
    );
    defineAsGeometryMultiPolygon(this);
  }
}

export class GeometryMultiPolygon extends GeometryMultiPolygonBase<
  GeometryMultiPolygonTypes<typeof GeometryPolygon>
> {
  static readonly Polygon = GeometryPolygon;

  constructor(source: GeometryMultiPolygonSource<typeof GeometryMultiPolygon>) {
    super(source, GeometryMultiPolygon);
  }
}
