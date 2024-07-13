import toSurql from "~/index/toSurql";
import { type Coord, GeometryAbc } from "../_lib/geometry";
import { map } from "../_lib/internal";
import type { Encodable } from "../_lib/types";
import type { GeoJsonMultiPoint } from "../encodable/GeometryMultiPoint";
import { GeometryPoint, type GeometryPointBase } from "./GeometryPoint";

export type * from "../encodable/GeometryMultiPoint";

type Point = GeometryPointBase<Coord>;

export class GeometryMultiPointBase<P extends new(arg: any) => Point>
  extends GeometryAbc<"MultiPoint">
  implements Encodable
{
  protected readonly _geo: {
    readonly Point: P;
  };

  points: InstanceType<P>[];

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

  get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.points, p => p.coordinates);
  }

  set coordinates(v: readonly ConstructorParameters<P>[0][]) {
    this.points = map(
      v,
      (p: any) =>
        (p instanceof this._geo.Point
          ? p
          : new this._geo.Point(p)) as InstanceType<P>,
    );
  }

  toJSON(): GeoJsonMultiPoint {
    return {
      type: this.type,
      coordinates: map(this.points, p => p.toJSON().coordinates),
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      coordinates: this.coordinates,
    });
  }

  structure(): {
    type: "MultiPoint";
    points: InstanceType<P>[];
  } {
    return {
      type: this.type,
      points: this.points,
    };
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
