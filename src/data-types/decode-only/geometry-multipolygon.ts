import { defineAsGeometryMultiPolygon } from "../_internals/define";
import { type Coord, type Geometry, map } from "../_internals/geometry";
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

export type GeometryMultiPolygonTypes<
  TPolygon extends PolygonBase = PolygonBase,
> = {
  readonly Polygon: TPolygon;
};

export type GeometryMultiPolygonSource<
  TTypes extends GeometryMultiPolygonTypes = GeometryMultiPolygonTypes,
> = readonly (
  | ConstructorParameters<TTypes["Polygon"]>[0]
  | InstanceType<TTypes["Polygon"]>
)[];

export class GeometryMultiPolygonBase<
  TTypes extends GeometryMultiPolygonTypes = GeometryMultiPolygonTypes,
> implements Geometry {
  readonly type = "MultiPolygon" as const;

  readonly polygons: readonly InstanceType<TTypes["Polygon"]>[];

  constructor(
    source: GeometryMultiPolygonSource<TTypes>,
    readonly types: TTypes,
  ) {
    this.polygons = map(
      source,
      (p: any) =>
        (p instanceof types.Polygon
          ? p
          : new types.Polygon(p)) as InstanceType<TTypes["Polygon"]>,
    );
    defineAsGeometryMultiPolygon(this);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-multi-polygon)
 */
export class GeometryMultiPolygon extends GeometryMultiPolygonBase<
  GeometryMultiPolygonTypes<typeof GeometryPolygon>
> {
  static readonly Polygon = GeometryPolygon;

  constructor(source: GeometryMultiPolygonSource<typeof GeometryMultiPolygon>) {
    super(source, GeometryMultiPolygon);
  }
}
