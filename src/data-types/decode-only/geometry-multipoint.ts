import { defineAsGeometryMultiPoint } from "../_internals/define";
import { type Coord, type Geometry, map } from "../_internals/geometry";
import {
  GeometryPoint,
  type GeometryPointBase,
  GeometryPointTypes,
} from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryMultiPointTypes<TPoint extends PointBase = PointBase> = {
  readonly Point: TPoint;
};

export type GeometryMultiPointSource<
  TTypes extends GeometryMultiPointTypes = GeometryMultiPointTypes,
> = readonly (
  | ConstructorParameters<TTypes["Point"]>[0]
  | InstanceType<TTypes["Point"]>
)[];

export class GeometryMultiPointBase<TTypes extends GeometryMultiPointTypes>
  implements Geometry
{
  readonly type = "MultiPoint" as const;

  readonly points: readonly InstanceType<TTypes["Point"]>[];

  constructor(
    source: GeometryMultiPointSource<TTypes>,
    readonly types: TTypes,
  ) {
    this.points = map(
      source,
      (p: any) =>
        (p instanceof types.Point
          ? p
          : new types.Point(p)) as InstanceType<TTypes["Point"]>,
    );
    defineAsGeometryMultiPoint(this);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-multi-point)
 */
export class GeometryMultiPoint
  extends GeometryMultiPointBase<GeometryMultiPointTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryMultiPointSource<typeof GeometryMultiPoint>) {
    super(source, GeometryMultiPoint);
  }
}
