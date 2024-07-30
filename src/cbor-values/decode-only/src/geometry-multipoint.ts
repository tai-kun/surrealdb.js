import { defineAsGeometryMultiPoint } from "~/cbor-values/define";
import { type Coord, type Geometry, map } from "~/cbor-values/geometry";
import { GeometryPoint, type GeometryPointBase } from "./geometry-point";

type Point = GeometryPointBase<Coord>;

export class GeometryMultiPointBase<P extends new(arg: any) => Point>
  implements Geometry
{
  protected readonly _geo: {
    readonly Point: P;
  };

  readonly type = "MultiPoint" as const;

  readonly points: readonly InstanceType<P>[];

  constructor(
    geo: {
      readonly Point: P;
    },
    points:
      | readonly ConstructorParameters<P>[0][]
      | Readonly<Pick<GeometryMultiPointBase<P>, "points">>,
  ) {
    this._geo = geo;
    this.points = !Array.isArray(points)
      ? [...points.points]
      : map(
        points,
        (p: any) =>
          (p instanceof geo.Point ? p : new geo.Point(p)) as InstanceType<P>,
      );
    defineAsGeometryMultiPoint(this);
  }
}

export class GeometryMultiPoint
  extends GeometryMultiPointBase<typeof GeometryPoint>
{
  static readonly Point = GeometryPoint;

  constructor(
    points:
      | readonly ConstructorParameters<typeof GeometryPoint>[0][]
      | Readonly<Pick<GeometryMultiPoint, "points">>,
  ) {
    super(GeometryMultiPoint, points);
  }
}
