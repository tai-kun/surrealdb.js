import {
  type GeoJsonLineString,
  GeometryLineBase as Base,
  type GeometryLineSource as GeometryLineSourceBase,
  type GeometryLineTypes as GeometryLineTypesBase,
} from "@tai-kun/surrealdb/data-types/encodable";
import { type Coord, isGeometryLine, map } from "../_internals/geometry";
import {
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryLineTypes<TPoint extends PointBase = PointBase> =
  GeometryLineTypesBase<TPoint>;

export type GeometryLineSource<
  TTypes extends GeometryLineTypes = GeometryLineTypes,
> = GeometryLineSourceBase<TTypes>;

export type { GeoJsonLineString };

export class GeometryLineBase<TTypes extends GeometryLineTypes>
  extends Base<TTypes>
{
  // @ts-expect-error readonly を外すだけ。
  override line: [
    InstanceType<TTypes["Point"]>,
    InstanceType<TTypes["Point"]>,
    ...InstanceType<TTypes["Point"]>[],
  ];

  override get coordinates(): [
    InstanceType<TTypes["Point"]>["coordinates"],
    InstanceType<TTypes["Point"]>["coordinates"],
    ...InstanceType<TTypes["Point"]>["coordinates"][],
  ] {
    return map(this.line, p => p.coordinates);
  }

  override set coordinates(source: GeometryLineSource<TTypes>) {
    this.line = map(
      source,
      p =>
        (p instanceof this.types.Point
          ? p
          : new this.types.Point(p)) as InstanceType<TTypes["Point"]>,
    );
  }

  clone(): this {
    const This = this.constructor as typeof GeometryLineBase;

    return new This(map(this.line, p => p.clone()), this.types) as this;
  }

  equals(other: unknown): boolean {
    return isGeometryLine<GeometryLineBase<GeometryLineTypes>>(other)
      && other.line.length === this.line.length
      && other.line.every((p, i) => this.line[i]!.equals(p));
  }

  isClosed(): boolean {
    return this.line[0].equals(this.line[this.line.length - 1]);
  }

  toClosed(): this {
    const line = this.clone();
    line.close();

    return line;
  }

  close(): void {
    if (!this.isClosed()) {
      this.line = [...this.line, this.line[0].clone()];
    }
  }
}

export class GeometryLine
  extends GeometryLineBase<GeometryLineTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryLineSource<typeof GeometryLine>) {
    super(source, GeometryLine);
  }
}
