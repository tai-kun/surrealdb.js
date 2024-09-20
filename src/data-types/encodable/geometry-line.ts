import {
  GeometryLineBase as Base,
  type GeometryLineSource as GeometryLineSourceBase,
  type GeometryLineTypes as GeometryLineTypesBase,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, map } from "../_internals/geometry";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";
import { CBOR_TAG_GEOMETRY_LINE, type Encodable } from "./spec";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryLineTypes<TPoint extends PointBase = PointBase> =
  GeometryLineTypesBase<TPoint>;

export type GeometryLineSource<
  TTypes extends GeometryLineTypes = GeometryLineTypes,
> = GeometryLineSourceBase<TTypes>;

export type GeoJsonLineString = {
  type: "LineString";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.4
  // > For type "LineString", the "coordinates" member is an array of two or
  // > more positions.
  coordinates: [
    GeoJsonPoint["coordinates"],
    GeoJsonPoint["coordinates"],
    ...GeoJsonPoint["coordinates"][],
  ];
};

export class GeometryLineBase<TTypes extends GeometryLineTypes>
  extends Base<TTypes>
  implements Encodable
{
  get coordinates(): [
    InstanceType<TTypes["Point"]>["coordinates"],
    InstanceType<TTypes["Point"]>["coordinates"],
    ...InstanceType<TTypes["Point"]>["coordinates"][],
  ] {
    return map(this.line, p => p.coordinates);
  }

  toCBOR(): [tag: typeof CBOR_TAG_GEOMETRY_LINE, value: this["line"]] {
    return [CBOR_TAG_GEOMETRY_LINE, this.line];
  }

  toJSON(): GeoJsonLineString {
    return {
      type: this.type,
      coordinates: map(this.line, p => p.toJSON().coordinates),
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
      line: this.line,
    };
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-line)
 */
export class GeometryLine
  extends GeometryLineBase<GeometryLineTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryLineSource<typeof GeometryLine>) {
    super(source, GeometryLine);
  }
}
