import { GeometryMultiPolygonBase as Base } from "../../standard/src/GeometryMultiPolygon";
import { GeometryPolygon, type GeometryPolygonBase } from "./GeometryPolygon";

export type * from "../../standard/src/GeometryMultiPolygon";

type Polygon = GeometryPolygonBase<new(_: any) => any>;

export class GeometryMultiPolygonBase<P extends new(arg: any) => Polygon>
  extends Base<P>
{
  clone(): this {
    // @ts-expect-error
    return new this.constructor({
      polygons: this.polygons.map(p => p.clone()),
    });
  }

  equal(other: unknown): boolean {
    return other instanceof GeometryMultiPolygonBase
      && other.polygons.length === this.polygons.length
      && other.polygons.every((p, i) => this.polygons[i]!.equal(p));
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
