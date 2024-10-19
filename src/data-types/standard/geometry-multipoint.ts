import {
  type GeoJsonMultiPoint,
  GeometryMultiPointBase as Base,
  type GeometryMultiPointSource as GeometryMultiPointSourceBase,
  type GeometryMultiPointTypes as GeometryMultiPointTypesBase,
} from "@tai-kun/surrealdb/encodable-datatypes";
import { type Coord, isGeometryMultiPoint, map } from "../_internals/geometry";
import {
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryMultiPointTypes<TPoint extends PointBase = PointBase> =
  GeometryMultiPointTypesBase<TPoint>;

export type GeometryMultiPointSource<
  TTypes extends GeometryMultiPointTypes = GeometryMultiPointTypes,
> = GeometryMultiPointSourceBase<TTypes>;

export type { GeoJsonMultiPoint };

export class GeometryMultiPointBase<TTypes extends GeometryMultiPointTypes>
  extends Base<TTypes>
{
  // @ts-expect-error readonly を外すだけ。
  override points: InstanceType<TTypes["Point"]>[];

  override get coordinates(): InstanceType<TTypes["Point"]>["coordinates"][] {
    return this.points.map(p => p.coordinates);
  }

  override set coordinates(source: GeometryMultiPointSource<TTypes>) {
    this.points = map(
      source,
      (p: any) =>
        (p instanceof this.types.Point
          ? p
          : new this.types.Point(p)) as InstanceType<TTypes["Point"]>,
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

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-multi-point)
 */
export class GeometryMultiPoint
  extends GeometryMultiPointBase<GeometryMultiPointTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryMultiPointSource<typeof GeometryMultiPoint>) {
    super(source, GeometryMultiPoint);
  }
}
