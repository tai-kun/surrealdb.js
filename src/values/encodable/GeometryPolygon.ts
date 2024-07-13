import toSurql from "~/index/toSurql";
import { map } from "../_lib/internal";
import type { Encodable } from "../_lib/types";
import { GeometryPolygonBase as Base } from "../decode-only/GeometryPolygon";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
} from "./GeometryLine";

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

  structure(): {
    type: "Polygon";
    polygon: readonly [InstanceType<L>, ...InstanceType<L>[]];
  } {
    return {
      type: this.type,
      polygon: this.polygon,
    };
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
