import {
  GeometryPointBase as Base,
  type GeometryPointSource,
  type GeometryPointTypes,
} from "@tai-kun/surrealdb/decodeonly-datatypes";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type CoordValue, map } from "../_internals/geometry";
import { CBOR_TAG_GEOMETRY_POINT, type Encodable } from "./spec";

export type { GeometryPointSource, GeometryPointTypes };

export type GeoJsonPoint = {
  type: "Point";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.2
  // > For type "Point", the "coordinates" member is a single position.
  coordinates: [x: number, y: number];
};

export class GeometryPointBase<TTypes extends GeometryPointTypes>
  extends Base<TTypes>
  implements Encodable
{
  get x(): CoordValue<TTypes["Coord"]> {
    return this.point[0];
  }

  get y(): CoordValue<TTypes["Coord"]> {
    return this.point[1];
  }

  get coordinates(): readonly [
    x: CoordValue<TTypes["Coord"]>,
    y: CoordValue<TTypes["Coord"]>,
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

  toPlainObject() {
    return {
      type: this.type,
      point: this.point,
    };
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-point)
 */
export class GeometryPoint
  extends GeometryPointBase<GeometryPointTypes<typeof Number>>
{
  static readonly Coord = Number;

  constructor(source: GeometryPointSource<typeof GeometryPoint>) {
    super(source, GeometryPoint);
  }
}
