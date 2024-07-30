import { GeometryPolygonBase as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { map } from "~/data-types/geometry";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
} from "./geometry-line";
import { CBOR_TAG_GEOMETRY_POLYGON, type Encodable } from "./spec";

export type GeoJsonPolygon = {
  type: "Polygon";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
  coordinates: [
    GeoJsonLineString["coordinates"],
    ...GeoJsonLineString["coordinates"][],
  ];
};

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryPolygonBase<L extends new(arg: any) => Line>
  extends Base<L>
  implements Encodable
{
  get coordinates(): [
    InstanceType<L>["coordinates"],
    ...InstanceType<L>["coordinates"][],
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
}

export class GeometryPolygon extends GeometryPolygonBase<typeof GeometryLine> {
  static readonly Line = GeometryLine;

  constructor(
    polygon:
      | readonly [
        ConstructorParameters<typeof GeometryLine>[0],
        ...ConstructorParameters<typeof GeometryLine>[0][],
      ]
      | Readonly<Pick<GeometryPolygon, "polygon">>,
  ) {
    super(GeometryPolygon, polygon);
  }
}
