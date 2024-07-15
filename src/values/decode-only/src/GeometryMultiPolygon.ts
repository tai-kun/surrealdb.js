import { map } from "@tai-kun/surreal/utils";
import GeometryAbc from "../../_shared/Geometry";
import { GeometryPolygon, type GeometryPolygonBase } from "./GeometryPolygon";

type Polygon = GeometryPolygonBase<new(_: any) => any>;

export class GeometryMultiPolygonBase<P extends new(arg: any) => Polygon>
  extends GeometryAbc<"MultiPolygon">
{
  protected readonly _geo: {
    readonly Polygon: P;
  };

  readonly polygons: readonly InstanceType<P>[];

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
          (
            p instanceof geo.Polygon ? p : new geo.Polygon(p)
          ) as InstanceType<P>,
      );
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
