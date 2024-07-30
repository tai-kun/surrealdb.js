import { GeometryPolygonBase as Base } from "@tai-kun/surreal/data-types/encodable";
import { isGeometryPolygon, map } from "~/data-types/geometry";
import { GeometryLine, type GeometryLineBase } from "./geometry-line";

type Line = GeometryLineBase<new(_: any) => any>;

export type { GeoJsonPolygon } from "@tai-kun/surreal/data-types/encodable";

export class GeometryPolygonBase<L extends new(arg: any) => Line>
  extends Base<L>
{
  // @ts-expect-error readonly を外すだけ。
  override polygon: [InstanceType<L>, ...InstanceType<L>[]];

  override get coordinates(): [
    InstanceType<L>["coordinates"],
    ...InstanceType<L>["coordinates"][],
  ] {
    return map(this.polygon, l => l.coordinates);
  }

  override set coordinates(
    v: readonly [ConstructorParameters<L>[0], ...ConstructorParameters<L>[0][]],
  ) {
    this.polygon = map(
      v,
      (l: any) =>
        (l instanceof this._geo.Line
          ? l
          : new this._geo.Line(l)) as InstanceType<L>,
    );
  }

  clone(): this {
    // @ts-expect-error
    return new this.constructor(this._geo, {
      polygon: this.polygon.map(l => l.clone()),
    });
  }

  equals(other: unknown): boolean {
    return isGeometryPolygon<GeometryPolygonBase<L>>(other)
      && other.polygon.length === this.polygon.length
      && other.polygon.every((l, i) => this.polygon[i]!.equals(l));
  }
}

export class GeometryPolygon extends GeometryPolygonBase<typeof GeometryLine> {
  static readonly Line = GeometryLine;

  constructor(
    polygon:
      | readonly [
        ConstructorParameters<typeof GeometryLine>[0],
        ...ConstructorParameters<typeof GeometryLine>[0][],
      ]
      | Readonly<Pick<GeometryPolygon, "polygon">>,
  ) {
    super(GeometryPolygon, polygon);
  }

  override clone(): this {
    // @ts-expect-error
    return new this.constructor({
      polygon: this.polygon.map(l => l.clone()),
    });
  }
}
