import { map } from "@tai-kun/surreal/utils";
import GeometryAbc, { type Coord } from "../../_shared/Geometry";
import { GeometryPoint, type GeometryPointBase } from "./GeometryPoint";

type Point = GeometryPointBase<Coord>;

export class GeometryMultiPointBase<P extends new(arg: any) => Point>
  extends GeometryAbc<"MultiPoint">
{
  protected readonly _geo: {
    readonly Point: P;
  };

  readonly points: readonly InstanceType<P>[];

  constructor(
    geo: {
      readonly Point: P;
    },
    points:
      | readonly ConstructorParameters<P>[0][]
      | Readonly<Pick<GeometryMultiPointBase<P>, "points">>,
  ) {
    super("MultiPoint");
    this._geo = geo;
    this.points = !Array.isArray(points)
      ? [...points.points]
      : map(
        points,
        (p: any) =>
          (p instanceof geo.Point ? p : new geo.Point(p)) as InstanceType<P>,
      );
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
