import { map, toSurql } from "@tai-kun/surreal/utils";
import GeometryAbc from "../../_shared/Geometry";
import type { Encodable } from "../../_shared/types";
import type { GeoJsonMultiPolygon } from "../../encodable/src/GeometryMultiPolygon";
import { GeometryPolygon, type GeometryPolygonBase } from "./GeometryPolygon";

export type * from "../../encodable/src/GeometryMultiPolygon";

type Polygon = GeometryPolygonBase<new(_: any) => any>;

export class GeometryMultiPolygonBase<P extends new(arg: any) => Polygon>
  extends GeometryAbc<"MultiPolygon">
  implements Encodable
{
  protected readonly _geo: {
    readonly Polygon: P;
  };

  polygons: InstanceType<P>[];

  constructor(
    geo: {
      readonly Polygon: P;
    },
    polygons:
      | readonly ConstructorParameters<P>[0][]
      | Readonly<Pick<GeometryMultiPolygonBase<P>, "polygons">>,
  ) {
    super("MultiPolygon");
    this._geo = geo;
    this.polygons = !Array.isArray(polygons)
      ? [...polygons.polygons]
      : map(
        polygons,
        (p: any) =>
          (p instanceof geo.Polygon ? p : new geo.Polygon(p)) as InstanceType<
            P
          >,
      );
  }

  get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.polygons, p => p.coordinates);
  }

  set coordinates(v: readonly ConstructorParameters<P>[0][]) {
    this.polygons = map(
      v,
      (p: any) =>
        (p instanceof this._geo.Polygon
          ? p
          : new this._geo.Polygon(p)) as InstanceType<P>,
    );
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
    polygons: InstanceType<P>[];
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
