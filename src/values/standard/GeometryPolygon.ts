import toSurql from "~/index/toSurql";
import { GeometryAbc } from "../_lib/geometry";
import { map } from "../_lib/internal";
import type { Encodable } from "../_lib/types";
import type { GeoJsonPolygon } from "../encodable/GeometryPolygon";
import { GeometryLine, type GeometryLineBase } from "./GeometryLine";

export type * from "../encodable/GeometryPolygon";

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryPolygonBase<L extends new(arg: any) => Line>
  extends GeometryAbc<"Polygon">
  implements Encodable
{
  protected readonly _geo: {
    readonly Line: L;
  };

  polygon: [InstanceType<L>, ...InstanceType<L>[]];

  constructor(
    geo: {
      readonly Line: L;
    },
    polygon:
      | readonly [ConstructorParameters<L>[0], ...ConstructorParameters<L>[0][]]
      | Readonly<Pick<GeometryPolygonBase<L>, "polygon">>,
  ) {
    super("Polygon");
    this._geo = geo;
    this.polygon = !Array.isArray(polygon)
      ? [...polygon.polygon]
      : map(
        polygon,
        (l: any) =>
          (l instanceof geo.Line ? l : new geo.Line(l)) as InstanceType<L>,
      );
  }

  get coordinates(): [
    InstanceType<L>["coordinates"],
    ...InstanceType<L>["coordinates"][],
  ] {
    return map(this.polygon, l => l.coordinates);
  }

  set coordinates(
    v: readonly [ConstructorParameters<L>[0], ...ConstructorParameters<L>[0][]],
  ) {
    this.polygon = map(
      v,
      (l: any) =>
        (l instanceof this._geo.Line
          ? l
          : new this._geo.Line(l)) as InstanceType<L>,
    );
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
    polygon: [InstanceType<L>, ...InstanceType<L>[]];
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
