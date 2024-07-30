import { GeometryMultiPolygonBase as Base } from "@tai-kun/surreal/data-types/decode-only";
import { toSurql } from "@tai-kun/surreal/utils";
import { map } from "~/data-types/geometry";
import {
  type GeoJsonPolygon,
  GeometryPolygon,
  type GeometryPolygonBase,
} from "./geometry-polygon";
import { type Encodable, TAG_GEOMETRY_MULTIPOLYGON } from "./spec";

export type GeoJsonMultiPolygon = {
  type: "MultiPolygon";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.7
  // For type "MultiPolygon", the "coordinates" member is an array of Polygon coordinate arrays.
  coordinates: GeoJsonPolygon["coordinates"][];
};

type Polygon = GeometryPolygonBase<new(_: any) => any>;

export class GeometryMultiPolygonBase<P extends new(arg: any) => Polygon>
  extends Base<P>
  implements Encodable
{
  get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.polygons, p => p.coordinates);
  }

  toCBOR(): [tag: typeof TAG_GEOMETRY_MULTIPOLYGON, value: this["polygons"]] {
    return [TAG_GEOMETRY_MULTIPOLYGON, this.polygons];
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
}

export class GeometryMultiPolygon
  extends GeometryMultiPolygonBase<typeof GeometryPolygon>
{
  static readonly Polygon = GeometryPolygon;

  constructor(
    polygons:
      | readonly ConstructorParameters<typeof GeometryPolygon>[0][]
      | Readonly<Pick<GeometryMultiPolygon, "polygons">>,
  ) {
    super(GeometryMultiPolygon, polygons);
  }
}
