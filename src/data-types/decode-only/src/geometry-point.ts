import { defineAsGeometryPoint } from "~/data-types/define";
import {
  type Coord,
  coord,
  type CoordArg,
  type CoordValue,
  type Geometry,
  map,
} from "~/data-types/geometry";

export class GeometryPointBase<C extends Coord> implements Geometry {
  protected readonly _geo: {
    readonly Coord: C;
  };

  readonly type = "Point" as const;

  readonly point: readonly [
    x: CoordValue<C>,
    y: CoordValue<C>,
  ];

  constructor(
    geo: {
      readonly Coord: C;
    },
    point:
      | readonly [x: CoordArg<C>, y: CoordArg<C>]
      | Readonly<Pick<GeometryPointBase<C>, "point">>,
  ) {
    this._geo = geo;
    this.point = !Array.isArray(point)
      ? [...point.point]
      : map(point, arg => coord(geo.Coord, arg));
    defineAsGeometryPoint(this);
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
