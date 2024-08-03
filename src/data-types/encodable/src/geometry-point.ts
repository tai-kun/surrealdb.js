import { GeometryPointBase as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, type CoordValue, map } from "~/data-types/geometry";
import { CBOR_TAG_GEOMETRY_POINT, type Encodable } from "./spec";

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

  toCBOR(): [tag: typeof CBOR_TAG_GEOMETRY_POINT, value: this["point"]] {
    return [CBOR_TAG_GEOMETRY_POINT, this.point];
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

  structure(): GeoJsonPoint {
    return this.toJSON();
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
