import toSurql from "~/index/toSurql";
import type { Coord, CoordValue } from "../_lib/geometry";
import { map } from "../_lib/internal";
import type { Encodable } from "../_lib/types";
import { GeometryPointBase as Base } from "../decode-only/GeometryPoint";

export type GeoJsonPoint = {
  type: "Point";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.2
  // For type "Point", the "coordinates" member is a single position.
  coordinates: [x: number, y: number];
};

export class GeometryPointBase<C extends Coord> extends Base<C>
  implements Encodable
{
  get x(): CoordValue<C> {
    return this.point[0];
  }

  get y(): CoordValue<C> {
    return this.point[1];
  }

  get coordinates(): readonly [x: CoordValue<C>, y: CoordValue<C>] {
    return this.point;
  }

  toJSON(): GeoJsonPoint {
    return {
      type: this.type,
      coordinates: map(this.coordinates, c => Number(c)),
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      coordinates: this.coordinates as any,
    });
  }

  structure(): {
    type: "Point";
    point: readonly [x: CoordValue<C>, y: CoordValue<C>];
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
