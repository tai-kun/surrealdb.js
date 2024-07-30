import { defineAsGeometryMultiPolygon } from "~/data-types/define";
import { type Geometry, map } from "~/data-types/geometry";
import { GeometryPolygon, type GeometryPolygonBase } from "./geometry-polygon";

type Polygon = GeometryPolygonBase<new(_: any) => any>;

export class GeometryMultiPolygonBase<P extends new(arg: any) => Polygon>
  implements Geometry
{
  protected readonly _geo: {
    readonly Polygon: P;
  };

  readonly type = "MultiPolygon" as const;

  readonly polygons: readonly InstanceType<P>[];

  constructor(
    geo: {
      readonly Polygon: P;
    },
    polygons:
      | readonly ConstructorParameters<P>[0][]
      | Readonly<Pick<GeometryMultiPolygonBase<P>, "polygons">>,
  ) {
    this._geo = geo;
    this.polygons = !Array.isArray(polygons)
      ? [...polygons.polygons]
      : map(
        polygons,
        (p: any) =>
          (
            p instanceof geo.Polygon ? p : new geo.Polygon(p)
          ) as InstanceType<P>,
      );
    defineAsGeometryMultiPolygon(this);
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
