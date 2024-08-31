import {
  GeometryMultiPointBase as Base,
  type GeometryMultiPointSource as GeometryMultiPointSourceBase,
  type GeometryMultiPointTypes as GeometryMultiPointTypesBase,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, map } from "~/data-types/_internals/geometry";
import {
  type GeoJsonPoint,
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";
import { CBOR_TAG_GEOMETRY_MULTIPOINT, type Encodable } from "./spec";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryMultiPointTypes<P extends PointBase = PointBase> =
  GeometryMultiPointTypesBase<P>;

export type GeometryMultiPointSource<
  T extends GeometryMultiPointTypes = GeometryMultiPointTypes,
> = GeometryMultiPointSourceBase<T>;

export type GeoJsonMultiPoint = {
  type: "MultiPoint";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.3
  // > For type "MultiPoint", the "coordinates" member is an array of positions.
  coordinates: GeoJsonPoint["coordinates"][];
};

export class GeometryMultiPointBase<T extends GeometryMultiPointTypes>
  extends Base<T>
  implements Encodable
{
  get coordinates(): InstanceType<T["Point"]>["coordinates"][] {
    return map(this.points, p => p.coordinates);
  }

  toCBOR(): [tag: typeof CBOR_TAG_GEOMETRY_MULTIPOINT, value: this["points"]] {
    return [CBOR_TAG_GEOMETRY_MULTIPOINT, this.points];
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

  toPlain() {
    return {
      type: this.type,
      points: this.points,
    };
  }
}

export class GeometryMultiPoint
  extends GeometryMultiPointBase<GeometryMultiPointTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryMultiPointSource<typeof GeometryMultiPoint>) {
    super(source, GeometryMultiPoint);
  }
}
