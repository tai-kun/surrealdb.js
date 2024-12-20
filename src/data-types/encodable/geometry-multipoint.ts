import {
  GeometryMultiPointBase as Base,
  type GeometryMultiPointSource as GeometryMultiPointSourceBase,
  type GeometryMultiPointTypes as GeometryMultiPointTypesBase,
} from "@tai-kun/surrealdb/decodeonly-datatypes";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, map } from "../_internals/geometry";
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

export type GeometryMultiPointTypes<TPoint extends PointBase = PointBase> =
  GeometryMultiPointTypesBase<TPoint>;

export type GeometryMultiPointSource<
  TTypes extends GeometryMultiPointTypes = GeometryMultiPointTypes,
> = GeometryMultiPointSourceBase<TTypes>;

export type GeoJsonMultiPoint = {
  type: "MultiPoint";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.3
  // > For type "MultiPoint", the "coordinates" member is an array of positions.
  coordinates: GeoJsonPoint["coordinates"][];
};

export class GeometryMultiPointBase<TTypes extends GeometryMultiPointTypes>
  extends Base<TTypes>
  implements Encodable
{
  get coordinates(): InstanceType<TTypes["Point"]>["coordinates"][] {
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

  toPlainObject() {
    return {
      type: this.type,
      points: this.points,
    };
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-multi-point)
 */
export class GeometryMultiPoint
  extends GeometryMultiPointBase<GeometryMultiPointTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryMultiPointSource<typeof GeometryMultiPoint>) {
    super(source, GeometryMultiPoint);
  }
}
