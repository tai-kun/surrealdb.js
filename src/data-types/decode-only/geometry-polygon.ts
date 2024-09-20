import { defineAsGeometryPolygon } from "../_internals/define";
import { type Coord, type Geometry, map } from "../_internals/geometry";
import {
  GeometryLine,
  type GeometryLineBase,
  type GeometryLineTypes,
} from "./geometry-line";
import type { GeometryPointBase, GeometryPointTypes } from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

type LineBase = new(
  source: any,
) => GeometryLineBase<GeometryLineTypes<PointBase>>;

export type GeometryPolygonTypes<TLine extends LineBase = LineBase> = {
  readonly Line: TLine;
};

export type GeometryPolygonSource<
  TTypes extends GeometryPolygonTypes = GeometryPolygonTypes,
> = readonly [
  (ConstructorParameters<TTypes["Line"]>[0] | InstanceType<TTypes["Line"]>),
  ...(
    | ConstructorParameters<TTypes["Line"]>[0]
    | InstanceType<TTypes["Line"]>
  )[],
];

export class GeometryPolygonBase<
  TTypes extends GeometryPolygonTypes = GeometryPolygonTypes,
> implements Geometry {
  readonly type = "Polygon" as const;

  readonly polygon: readonly [
    InstanceType<TTypes["Line"]>,
    ...InstanceType<TTypes["Line"]>[],
  ];

  constructor(source: GeometryPolygonSource<TTypes>, readonly types: TTypes) {
    this.polygon = map(
      source,
      (l: any) =>
        (l instanceof types.Line
          ? l
          : new types.Line(l)) as InstanceType<TTypes["Line"]>,
    );
    defineAsGeometryPolygon(this);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-polygon)
 */
export class GeometryPolygon
  extends GeometryPolygonBase<GeometryPolygonTypes<typeof GeometryLine>>
{
  static readonly Line = GeometryLine;

  constructor(source: GeometryPolygonSource<typeof GeometryPolygon>) {
    super(source, GeometryPolygon);
  }
}
