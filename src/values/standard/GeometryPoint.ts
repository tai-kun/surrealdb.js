import toSurql from "~/index/toSurql";
import {
  type Coord,
  coord,
  type CoordArg,
  type CoordValue,
  GeometryAbc,
} from "../_lib/geometry";
import { map } from "../_lib/internal";
import type { Encodable } from "../_lib/types";
import type { GeoJsonPoint } from "../encodable/GeometryPoint";

export type * from "../encodable/GeometryPoint";

export class GeometryPointBase<C extends Coord> extends GeometryAbc<"Point">
  implements Encodable
{
  protected readonly _geo: {
    readonly Coord: C;
  };

  point: [x: CoordValue<C>, y: CoordValue<C>];

  constructor(
    geo: {
      readonly Coord: C;
    },
    point:
      | readonly [x: CoordArg<C>, y: CoordArg<C>]
      | Readonly<Pick<GeometryPointBase<C>, "point">>,
  ) {
    super("Point");
    this._geo = geo;
    this.point = !Array.isArray(point)
      ? [...point.point]
      : map(point, arg => coord(geo.Coord, arg));
  }

  get x(): CoordValue<C> {
    return this.point[0];
  }

  set x(v: CoordValue<C>) {
    this.point[0] = v;
  }

  get y(): CoordValue<C> {
    return this.point[1];
  }

  set y(v: CoordValue<C>) {
    this.point[1] = v;
  }

  get coordinates(): [x: CoordValue<C>, y: CoordValue<C>] {
    return this.point;
  }

  set coordinates(v: readonly [x: CoordArg<C>, y: CoordArg<C>]) {
    this.point = map(v, arg => coord(this._geo.Coord, arg));
  }

  toJSON(): GeoJsonPoint {
    return {
      type: this.type,
      coordinates: map(this.point, c => Number(c)),
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      coordinates: this.point as any,
    });
  }

  structure(): {
    type: "Point";
    point: [x: CoordValue<C>, y: CoordValue<C>];
  } {
    return {
      type: this.type,
      point: this.point,
    };
  }
}

export class GeometryPoint extends GeometryPointBase<typeof Number> {
  static readonly Coord = Number;

  constructor(
    point:
      | readonly [x: unknown, y: unknown]
      | Readonly<Pick<GeometryPoint, "point">>,
  ) {
    super(GeometryPoint, point);
  }
}
