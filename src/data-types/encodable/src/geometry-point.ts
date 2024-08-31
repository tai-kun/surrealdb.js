import {
  GeometryPointBase as Base,
  type GeometryPointSource,
  type GeometryPointTypes,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type CoordValue, map } from "~/data-types/_internals/geometry";
import { CBOR_TAG_GEOMETRY_POINT, type Encodable } from "./spec";

export type { GeometryPointSource, GeometryPointTypes };

export type GeoJsonPoint = {
  type: "Point";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.2
  // > For type "Point", the "coordinates" member is a single position.
  coordinates: [x: number, y: number];
};

export class GeometryPointBase<T extends GeometryPointTypes> extends Base<T>
  implements Encodable
{
  get x(): CoordValue<T["Coord"]> {
    return this.point[0];
  }

  get y(): CoordValue<T["Coord"]> {
    return this.point[1];
  }

  get coordinates(): readonly [
    x: CoordValue<T["Coord"]>,
    y: CoordValue<T["Coord"]>,
  ] {
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

  structure() {
    return {
      type: this.type,
      point: this.point,
    };
  }
}

export class GeometryPoint
  extends GeometryPointBase<GeometryPointTypes<typeof Number>>
{
  static readonly Coord = Number;

  constructor(source: GeometryPointSource<typeof GeometryPoint>) {
    super(source, GeometryPoint);
  }
}
