import {
  type Coord,
  coord,
  type CoordArg,
  type CoordValue,
  GeometryAbc,
} from "../_lib/geometry";
import { map } from "../_lib/internal";

export class GeometryPointBase<C extends Coord> extends GeometryAbc<"Point"> {
  protected readonly _geo: {
    readonly Coord: C;
  };

  readonly point: readonly [x: CoordValue<C>, y: CoordValue<C>];

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
