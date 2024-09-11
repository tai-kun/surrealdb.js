import {
  type GeoJsonMultiPoint,
  GeometryMultiPointBase as Base,
  type GeometryMultiPointSource as GeometryMultiPointSourceBase,
  type GeometryMultiPointTypes as GeometryMultiPointTypesBase,
} from "@tai-kun/surrealdb/data-types/encodable";
import { type Coord, isGeometryMultiPoint, map } from "../_internals/geometry";
import {
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryMultiPointTypes<P extends PointBase = PointBase> =
  GeometryMultiPointTypesBase<P>;

export type GeometryMultiPointSource<
  T extends GeometryMultiPointTypes = GeometryMultiPointTypes,
> = GeometryMultiPointSourceBase<T>;

export type { GeoJsonMultiPoint };

export class GeometryMultiPointBase<T extends GeometryMultiPointTypes>
  extends Base<T>
{
  // @ts-expect-error readonly を外すだけ。
  override points: InstanceType<T["Point"]>[];

  override get coordinates(): InstanceType<T["Point"]>["coordinates"][] {
    return this.points.map(p => p.coordinates);
  }

  override set coordinates(source: GeometryMultiPointSource<T>) {
    this.points = map(
      source,
      (p: any) =>
        (p instanceof this.types.Point
          ? p
          : new this.types.Point(p)) as InstanceType<T["Point"]>,
    );
  }

  clone(): this {
    const This = this.constructor as typeof GeometryMultiPointBase;

    return new This(this.points.map(p => p.clone()), this.types) as this;
  }

  equals(other: unknown): boolean {
    return isGeometryMultiPoint<
      GeometryMultiPointBase<GeometryMultiPointTypes>
    >(other)
      && other.points.length === this.points.length
      && other.points.every((p, i) => this.points[i]!.equals(p));
  }
}

export class GeometryMultiPoint
  extends GeometryMultiPointBase<GeometryMultiPointTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryMultiPointSource<typeof GeometryMultiPoint>) {
    super(source, GeometryMultiPoint);
  }
}
