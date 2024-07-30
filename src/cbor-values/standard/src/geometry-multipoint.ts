import { GeometryMultiPointBase as Base } from "~/cbor-values/encodable";
import { type Coord, isGeometryMultiPoint, map } from "~/cbor-values/geometry";
import { GeometryPoint, type GeometryPointBase } from "./geometry-point";

type Point = GeometryPointBase<Coord>;

export type { GeoJsonMultiPoint } from "@tai-kun/surreal/cbor-values/encodable";

export class GeometryMultiPointBase<P extends new(arg: any) => Point>
  extends Base<P>
{
  // @ts-expect-error readonly を外すだけ。
  override points: InstanceType<P>[];

  override get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.points, p => p.coordinates);
  }

  override set coordinates(v: readonly ConstructorParameters<P>[0][]) {
    this.points = map(
      v,
      (p: any) =>
        (p instanceof this._geo.Point
          ? p
          : new this._geo.Point(p)) as InstanceType<P>,
    );
  }

  clone(): this {
    // @ts-expect-error
    return new this.constructor(this._geo, {
      points: this.points.map(p => p.clone()),
    });
  }

  equals(other: unknown): boolean {
    return isGeometryMultiPoint<GeometryMultiPointBase<P>>(other)
      && other.points.length === this.points.length
      && other.points.every((p, i) => this.points[i]!.equals(p));
  }
}

export class GeometryMultiPoint
  extends GeometryMultiPointBase<typeof GeometryPoint>
{
  static readonly Point = GeometryPoint;

  constructor(
    points:
      | readonly ConstructorParameters<typeof GeometryPoint>[0][]
      | Readonly<Pick<GeometryMultiPoint, "points">>,
  ) {
    super(GeometryMultiPoint, points);
  }

  override clone(): this {
    // @ts-expect-error
    return new this.constructor({
      points: this.points.map(p => p.clone()),
    });
  }
}
