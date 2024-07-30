import { GeometryPointBase as Base } from "@tai-kun/surreal/cbor-values/decode-only";
import { toSurql } from "@tai-kun/surreal/utils";
import { type Coord, type CoordValue, map } from "~/cbor-values/geometry";
import { type Encodable, TAG_GEOMETRY_POINT } from "./spec";

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

  toCBOR(): [tag: typeof TAG_GEOMETRY_POINT, value: this["point"]] {
    return [TAG_GEOMETRY_POINT, this.point];
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
      coordinates: this.coordinates,
    });
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
