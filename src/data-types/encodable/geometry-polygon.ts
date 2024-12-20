import {
  GeometryPolygonBase as Base,
  type GeometryPolygonSource as GeometryPolygonSourceBase,
  type GeometryPolygonTypes as GeometryPolygonTypesBase,
} from "@tai-kun/surrealdb/decodeonly-datatypes";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, map } from "../_internals/geometry";
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

export type GeometryPolygonTypes<TLine extends LineBase = LineBase> =
  GeometryPolygonTypesBase<TLine>;

export type GeometryPolygonSource<
  TTypes extends GeometryPolygonTypes = GeometryPolygonTypes,
> = GeometryPolygonSourceBase<TTypes>;

export type GeoJsonPolygon = {
  type: "Polygon";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
  coordinates: [
    GeoJsonLineString["coordinates"],
    ...GeoJsonLineString["coordinates"][],
  ];
};

export class GeometryPolygonBase<
  TTypes extends GeometryPolygonTypes = GeometryPolygonTypes,
> extends Base<TTypes> implements Encodable {
  get coordinates(): [
    InstanceType<TTypes["Line"]>["coordinates"],
    ...InstanceType<TTypes["Line"]>["coordinates"][],
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

  toPlainObject() {
    return {
      type: this.type,
      polygon: this.polygon,
    };
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-polygon)
 */
export class GeometryPolygon
  extends GeometryPolygonBase<GeometryPolygonTypes<typeof GeometryLine>>
{
  static readonly Line = GeometryLine;

  constructor(source: GeometryPolygonSource<typeof GeometryPolygon>) {
    super(source, GeometryPolygon);
  }
}
