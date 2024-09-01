import {
  GeometryPolygonBase as Base,
  type GeometryPolygonSource as GeometryPolygonSourceBase,
  type GeometryPolygonTypes as GeometryPolygonTypesBase,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, map } from "../../_internals/geometry";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
  type GeometryLineTypes,
} from "./geometry-line";
import type { GeometryPointBase, GeometryPointTypes } from "./geometry-point";
import { CBOR_TAG_GEOMETRY_POLYGON, type Encodable } from "./spec";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

type LineBase = new(
  source: any,
) => GeometryLineBase<GeometryLineTypes<PointBase>>;

export type GeometryPolygonTypes<L extends LineBase = LineBase> =
  GeometryPolygonTypesBase<L>;

export type GeometryPolygonSource<
  T extends GeometryPolygonTypes = GeometryPolygonTypes,
> = GeometryPolygonSourceBase<T>;

export type GeoJsonPolygon = {
  type: "Polygon";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
  coordinates: [
    GeoJsonLineString["coordinates"],
    ...GeoJsonLineString["coordinates"][],
  ];
};

export class GeometryPolygonBase<
  T extends GeometryPolygonTypes = GeometryPolygonTypes,
> extends Base<T> implements Encodable {
  get coordinates(): [
    InstanceType<T["Line"]>["coordinates"],
    ...InstanceType<T["Line"]>["coordinates"][],
  ] {
    return map(this.polygon, l => l.coordinates);
  }

  toCBOR(): [tag: typeof CBOR_TAG_GEOMETRY_POLYGON, value: this["polygon"]] {
    return [CBOR_TAG_GEOMETRY_POLYGON, this.polygon];
  }

  toJSON(): GeoJsonPolygon {
    return {
      type: this.type,
      coordinates: map(this.polygon, l => l.toJSON().coordinates),
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
      polygon: this.polygon,
    };
  }
}

export class GeometryPolygon
  extends GeometryPolygonBase<GeometryPolygonTypes<typeof GeometryLine>>
{
  static readonly Line = GeometryLine;

  constructor(source: GeometryPolygonSource<typeof GeometryPolygon>) {
    super(source, GeometryPolygon);
  }
}
