import { defineAsGeometryMultiPoint } from "~/data-types/_internals/define";
import {
  type Coord,
  type Geometry,
  map,
} from "~/data-types/_internals/geometry";
import {
  GeometryPoint,
  type GeometryPointBase,
  GeometryPointTypes,
} from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryMultiPointTypes<P extends PointBase = PointBase> = {
  readonly Point: P;
};

export type GeometryMultiPointSource<
  T extends GeometryMultiPointTypes = GeometryMultiPointTypes,
> = readonly (
  | ConstructorParameters<T["Point"]>[0]
  | InstanceType<T["Point"]>
)[];

export class GeometryMultiPointBase<T extends GeometryMultiPointTypes>
  implements Geometry
{
  readonly type = "MultiPoint" as const;

  readonly points: readonly InstanceType<T["Point"]>[];

  constructor(source: GeometryMultiPointSource<T>, readonly types: T) {
    this.points = map(
      source,
      (p: any) =>
        (p instanceof types.Point
          ? p
          : new types.Point(p)) as InstanceType<T["Point"]>,
    );
    defineAsGeometryMultiPoint(this);
  }
}

export class GeometryMultiPoint
  extends GeometryMultiPointBase<GeometryMultiPointTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryMultiPointSource<typeof GeometryMultiPoint>) {
    super(source, GeometryMultiPoint);
  }
}
