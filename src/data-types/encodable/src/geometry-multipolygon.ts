import {
  GeometryMultiPolygonBase as Base,
  type GeometryMultiPolygonSource as GeometryMultiPolygonSourceBase,
  type GeometryMultiPolygonTypes as GeometryMultiPolygonTypesBase,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, map } from "../../_internals/geometry";
import type { GeometryLineBase, GeometryLineTypes } from "./geometry-line";
import type { GeometryPointBase, GeometryPointTypes } from "./geometry-point";
import {
  type GeoJsonPolygon,
  GeometryPolygon,
  type GeometryPolygonBase,
  type GeometryPolygonTypes,
} from "./geometry-polygon";
import { CBOR_TAG_GEOMETRY_MULTIPOLYGON, type Encodable } from "./spec";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

type LineBase = new(
  source: any,
) => GeometryLineBase<GeometryLineTypes<PointBase>>;

type PolygonBase = new(
  source: any,
) => GeometryPolygonBase<GeometryPolygonTypes<LineBase>>;

export type GeometryMultiPolygonTypes<P extends PolygonBase = PolygonBase> =
  GeometryMultiPolygonTypesBase<P>;

export type GeometryMultiPolygonSource<
  T extends GeometryMultiPolygonTypes = GeometryMultiPolygonTypes,
> = GeometryMultiPolygonSourceBase<T>;

export type GeoJsonMultiPolygon = {
  type: "MultiPolygon";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.7
  // For type "MultiPolygon", the "coordinates" member is an array of Polygon coordinate arrays.
  coordinates: GeoJsonPolygon["coordinates"][];
};

export class GeometryMultiPolygonBase<
  T extends GeometryMultiPolygonTypes = GeometryMultiPolygonTypes,
> extends Base<T> implements Encodable {
  get coordinates(): InstanceType<T["Polygon"]>["coordinates"][] {
    return map(this.polygons, p => p.coordinates);
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_GEOMETRY_MULTIPOLYGON,
    value: this["polygons"],
  ] {
    return [CBOR_TAG_GEOMETRY_MULTIPOLYGON, this.polygons];
  }

  toJSON(): GeoJsonMultiPolygon {
    return {
      type: this.type,
      coordinates: map(this.polygons, p => p.toJSON().coordinates),
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
      polygons: this.polygons,
    };
  }
}

export class GeometryMultiPolygon extends GeometryMultiPolygonBase<
  GeometryMultiPolygonTypes<typeof GeometryPolygon>
> {
  static readonly Polygon = GeometryPolygon;

  constructor(source: GeometryMultiPolygonSource<typeof GeometryMultiPolygon>) {
    super(source, GeometryMultiPolygon);
  }
}
