import { map, toSurql } from "@tai-kun/surreal/utils";
import type { Coord } from "../../_shared/Geometry";
import type { Encodable } from "../../_shared/types";
import { GeometryMultiPointBase as Base } from "../../decode-only/src/GeometryMultiPoint";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
} from "./GeometryPoint";

export type GeoJsonMultiPoint = {
  type: "MultiPoint";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.3
  // For type "MultiPoint", the "coordinates" member is an array of positions.
  coordinates: GeoJsonPoint["coordinates"][];
};

type Point = GeometryPointBase<Coord>;

export class GeometryMultiPointBase<P extends new(arg: any) => Point>
  extends Base<P>
  implements Encodable
{
  get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.points, p => p.coordinates);
  }

  toJSON(): GeoJsonMultiPoint {
    return {
      type: this.type,
      coordinates: map(this.points, p => p.toJSON().coordinates),
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      coordinates: this.coordinates,
    });
  }

  structure(): {
    type: "MultiPoint";
    points: readonly InstanceType<P>[];
  } {
    return {
      type: this.type,
      points: this.points,
    };
  }
}

export class GeometryMultiPoint
  extends GeometryMultiPointBase<typeof GeometryPoint>
{
  static readonly Point = GeometryPoint;

  constructor(
    points:
      | readonly ConstructorParameters<typeof GeometryPoint>[0][]
      | Readonly<Pick<GeometryMultiPoint, "points">>,
  ) {
    super(GeometryMultiPoint, points);
  }
}
