import { GeometryMultiPolygonBase as Base } from "~/data-types/encodable";
import { isGeometryMultiPolygon, map } from "~/data-types/geometry";
import { GeometryPolygon, type GeometryPolygonBase } from "./geometry-polygon";

type Polygon = GeometryPolygonBase<new(_: any) => any>;

export type { GeoJsonMultiPolygon } from "@tai-kun/surrealdb/data-types/encodable";

export class GeometryMultiPolygonBase<P extends new(arg: any) => Polygon>
  extends Base<P>
{
  // @ts-expect-error readonly を外すだけ。
  override polygons: InstanceType<P>[];

  override get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.polygons, p => p.coordinates);
  }

  override set coordinates(v: readonly ConstructorParameters<P>[0][]) {
    this.polygons = map(
      v,
      (p: any) =>
        (p instanceof this._geo.Polygon
          ? p
          : new this._geo.Polygon(p)) as InstanceType<P>,
    );
  }

  clone(): this {
    // @ts-expect-error
    return new this.constructor(this._geo, {
      polygons: this.polygons.map(p => p.clone()),
    });
  }

  equals(other: unknown): boolean {
    return isGeometryMultiPolygon<GeometryMultiPolygonBase<P>>(other)
      && other.polygons.length === this.polygons.length
      && other.polygons.every((p, i) => this.polygons[i]!.equals(p));
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

  override clone(): this {
    // @ts-expect-error
    return new this.constructor({
      polygons: this.polygons.map(p => p.clone()),
    });
  }
}
