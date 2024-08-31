import {
  type GeoJsonMultiPolygon,
  GeometryMultiPolygonBase as Base,
  type GeometryMultiPolygonSource as GeometryMultiPolygonSourceBase,
  type GeometryMultiPolygonTypes as GeometryMultiPolygonTypesBase,
} from "@tai-kun/surrealdb/data-types/encodable";
import {
  type Coord,
  isGeometryMultiPolygon,
  map,
} from "~/data-types/_internals/geometry";
import type { GeometryLineBase, GeometryLineTypes } from "./geometry-line";
import type { GeometryPointBase, GeometryPointTypes } from "./geometry-point";
import {
  GeometryPolygon,
  type GeometryPolygonBase,
  type GeometryPolygonTypes,
} from "./geometry-polygon";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

type LineBase = new(
  source: any,
) => GeometryLineBase<GeometryLineTypes<PointBase>>;

type PolygonBase = new(
  source: any,
) => GeometryPolygonBase<GeometryPolygonTypes<LineBase>>;

export type GeometryMultiPolygonTypes<P extends PolygonBase = PolygonBase> =
  GeometryMultiPolygonTypesBase<P>;

export type GeometryMultiPolygonSource<
  T extends GeometryMultiPolygonTypes = GeometryMultiPolygonTypes,
> = GeometryMultiPolygonSourceBase<T>;

export type { GeoJsonMultiPolygon };

export class GeometryMultiPolygonBase<
  T extends GeometryMultiPolygonTypes = GeometryMultiPolygonTypes,
> extends Base<T> {
  // @ts-expect-error readonly を外すだけ。
  override polygons: InstanceType<T["Polygon"]>[];

  override get coordinates(): InstanceType<T["Polygon"]>["coordinates"][] {
    return this.polygons.map(p => p.coordinates);
  }

  override set coordinates(source: GeometryMultiPolygonSource<T>) {
    this.polygons = map(
      source,
      (p: any) =>
        (p instanceof this.types.Polygon
          ? p
          : new this.types.Polygon(p)) as InstanceType<T["Polygon"]>,
    );
  }

  clone(): this {
    const This = this.constructor as typeof GeometryMultiPolygonBase;

    return new This(this.polygons.map(p => p.clone()), this.types) as this;
  }

  equals(other: unknown): boolean {
    return isGeometryMultiPolygon<
      GeometryMultiPolygonBase<GeometryMultiPolygonTypes>
    >(other)
      && other.polygons.length === this.polygons.length
      && other.polygons.every((p, i) => this.polygons[i]!.equals(p));
  }
}

export class GeometryMultiPolygon extends GeometryMultiPolygonBase<
  GeometryMultiPolygonTypes<typeof GeometryPolygon>
> {
  static readonly Polygon = GeometryPolygon;

  constructor(source: GeometryMultiPolygonSource<typeof GeometryMultiPolygon>) {
    super(source, GeometryMultiPolygon);
  }
}
