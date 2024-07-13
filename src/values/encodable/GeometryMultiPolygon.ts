import toSurql from "~/index/toSurql";
import { map } from "../_lib/internal";
import type { Encodable } from "../_lib/types";
import { GeometryMultiPolygonBase as Base } from "../decode-only/GeometryMultiPolygon";
import {
  type GeoJsonPolygon,
  GeometryPolygon,
  type GeometryPolygonBase,
} from "./GeometryPolygon";

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

  structure(): {
    type: "MultiPolygon";
    polygons: readonly InstanceType<P>[];
  } {
    return {
      type: this.type,
      polygons: this.polygons,
    };
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
