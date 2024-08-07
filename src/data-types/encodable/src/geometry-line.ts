import { GeometryLineBase as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, map } from "~/data-types/geometry";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
} from "./geometry-point";
import { CBOR_TAG_GEOMETRY_LINE, type Encodable } from "./spec";

export type GeoJsonLineString = {
  type: "LineString";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.4
  // For type "LineString", the "coordinates" member is an array of two or more positions.
  coordinates: [
    GeoJsonPoint["coordinates"],
    GeoJsonPoint["coordinates"],
    ...GeoJsonPoint["coordinates"][],
  ];
};

type Point = GeometryPointBase<Coord>;

export class GeometryLineBase<P extends new(arg: any) => Point> extends Base<P>
  implements Encodable
{
  get coordinates(): [
    InstanceType<P>["coordinates"],
    InstanceType<P>["coordinates"],
    ...InstanceType<P>["coordinates"][],
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

  structure(): GeoJsonLineString {
    return this.toJSON();
  }
}

export class GeometryLine extends GeometryLineBase<typeof GeometryPoint> {
  static readonly Point = GeometryPoint;

  constructor(
    line:
      | readonly [
        ConstructorParameters<typeof GeometryPoint>[0],
        ConstructorParameters<typeof GeometryPoint>[0],
        ...ConstructorParameters<typeof GeometryPoint>[0][],
      ]
      | Readonly<Pick<GeometryLine, "line">>,
  ) {
    super(GeometryLine, line);
  }
}
