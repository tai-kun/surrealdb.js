import { GeometryMultiPointBase as Base } from "@tai-kun/surreal/cbor-values/decode-only";
import { toSurql } from "@tai-kun/surreal/utils";
import { type Coord, map } from "~/cbor-values/geometry";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
} from "./geometry-point";
import { type Encodable, TAG_GEOMETRY_MULTIPOINT } from "./spec";

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

  toCBOR(): [tag: typeof TAG_GEOMETRY_MULTIPOINT, value: this["points"]] {
    return [TAG_GEOMETRY_MULTIPOINT, this.points];
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
