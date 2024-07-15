import { map, toSurql } from "@tai-kun/surreal/utils";
import type { Coord } from "../../_shared/Geometry";
import type { Encodable } from "../../_shared/types";
import { GeometryLineBase as Base } from "../../decode-only/src/GeometryLine";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
} from "./GeometryPoint";

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

  structure(): {
    type: "LineString";
    line: readonly [InstanceType<P>, InstanceType<P>, ...InstanceType<P>[]];
  } {
    return {
      type: this.type,
      line: this.line,
    };
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
