import {
  type GeoJsonPolygon,
  GeometryPolygonBase as Base,
  type GeometryPolygonSource as GeometryPolygonSourceBase,
  type GeometryPolygonTypes as GeometryPolygonTypesBase,
} from "@tai-kun/surrealdb/data-types/encodable";
import { type Coord, isGeometryPolygon, map } from "../../_internals/geometry";
import {
  GeometryLine,
  type GeometryLineBase,
  type GeometryLineTypes,
} from "./geometry-line";
import type { GeometryPointBase, GeometryPointTypes } from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

type LineBase = new(
  source: any,
) => GeometryLineBase<GeometryLineTypes<PointBase>>;

export type GeometryPolygonTypes<L extends LineBase = LineBase> =
  GeometryPolygonTypesBase<L>;

export type GeometryPolygonSource<
  T extends GeometryPolygonTypes = GeometryPolygonTypes,
> = GeometryPolygonSourceBase<T>;

export type { GeoJsonPolygon };

export class GeometryPolygonBase<
  T extends GeometryPolygonTypes = GeometryPolygonTypes,
> extends Base<T> {
  // @ts-expect-error readonly を外すだけ。
  override polygon: [InstanceType<T["Line"]>, ...InstanceType<T["Line"]>[]];

  override get coordinates(): [
    InstanceType<T["Line"]>["coordinates"],
    ...InstanceType<T["Line"]>["coordinates"][],
  ] {
    return map(this.polygon, l => l.coordinates);
  }

  override set coordinates(source: GeometryPolygonSource<T>) {
    this.polygon = map(
      source,
      (l: any) =>
        (l instanceof this.types.Line
          ? l
          : new this.types.Line(l)) as InstanceType<T["Line"]>,
    );
  }

  get exteriorRing(): InstanceType<T["Line"]> {
    return this.polygon[0];
  }

  set exteriorRing(v: InstanceType<T["Line"]>) {
    this.polygon = [v, ...this.interiorRings];
  }

  get interiorRings(): InstanceType<T["Line"]>[] {
    return this.polygon.slice(1);
  }

  set interiorRings(v: InstanceType<T["Line"]>[]) {
    this.polygon = [this.exteriorRing, ...v];
  }

  clone(): this {
    const This = this.constructor as typeof GeometryPolygonBase;

    return new This(map(this.polygon, l => l.clone()), this.types) as this;
  }

  equals(other: unknown): boolean {
    return isGeometryPolygon<GeometryPolygonBase<GeometryPolygonTypes>>(other)
      && other.polygon.length === this.polygon.length
      && other.polygon.every((l, i) => this.polygon[i]!.equals(l));
  }
}

export class GeometryPolygon
  extends GeometryPolygonBase<GeometryPolygonTypes<typeof GeometryLine>>
{
  static readonly Line = GeometryLine;

  constructor(source: GeometryPolygonSource<typeof GeometryPolygon>) {
    super(source, GeometryPolygon);
  }
}
