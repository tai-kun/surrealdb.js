import type { Coord } from "../_lib/geometry";
import { GeometryMultiPointBase as Base } from "../standard/GeometryMultiPoint";
import { GeometryPoint, type GeometryPointBase } from "./GeometryPoint";

export type * from "../standard/GeometryMultiPoint";

type Point = GeometryPointBase<Coord>;

export class GeometryMultiPointBase<P extends new(arg: any) => Point>
  extends Base<P>
{
  clone(): this {
    // @ts-expect-error
    return new this.constructor({
      points: this.points.map(p => p.clone()),
    });
  }

  equal(other: unknown): boolean {
    return other instanceof GeometryMultiPointBase
      && other.points.length === this.points.length
      && other.points.every((p, i) => this.points[i]!.equal(p));
  }
}

export class GeometryMultiPoint
  extends GeometryMultiPointBase<typeof GeometryPoint>
{
  static readonly Point = GeometryPoint;

  constructor(
    points:
      | readonly [
        ConstructorParameters<typeof GeometryPoint>[0],
        ConstructorParameters<typeof GeometryPoint>[0],
        ...ConstructorParameters<typeof GeometryPoint>[0][],
      ]
      | Readonly<Pick<GeometryMultiPoint, "points">>,
  ) {
    super(GeometryMultiPoint, points);
  }
}
