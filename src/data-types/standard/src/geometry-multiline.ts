import {
  type GeoJsonMultiLine,
  GeometryMultiLineBase as Base,
  type GeometryMultiLineSource as GeometryMultiLineSourceBase,
  type GeometryMultiLineTypes as GeometryMultiLineTypesBase,
} from "~/data-types/encodable";
import { type Coord, isGeometryMultiLine, map } from "~/data-types/geometry";
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

export type GeometryMultiLineTypes<L extends LineBase = LineBase> =
  GeometryMultiLineTypesBase<L>;

export type GeometryMultiLineSource<
  T extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> = GeometryMultiLineSourceBase<T>;

export type { GeoJsonMultiLine };

export class GeometryMultiLineBase<
  T extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> extends Base<T> {
  // @ts-expect-error readonly を外すだけ。
  override lines: InstanceType<T["Line"]>[];

  override get coordinates(): InstanceType<T["Line"]>["coordinates"][] {
    return this.lines.map(l => l.coordinates);
  }

  override set coordinates(source: GeometryMultiLineSource<T>) {
    this.lines = map(
      source,
      (l: any) =>
        (l instanceof this.types.Line
          ? l
          : new this.types.Line(l)) as InstanceType<T["Line"]>,
    );
  }

  clone(): this {
    const This = this.constructor as typeof GeometryMultiLineBase;

    return new This(this.lines.map(l => l.clone()), this.types) as this;
  }

  equals(other: unknown): boolean {
    return isGeometryMultiLine<
      GeometryMultiLineBase<GeometryMultiLineTypes>
    >(other)
      && other.lines.length === this.lines.length
      && other.lines.every((l, i) => this.lines[i]!.equals(l));
  }
}

export class GeometryMultiLine
  extends GeometryMultiLineBase<GeometryMultiLineTypes<typeof GeometryLine>>
{
  static readonly Line = GeometryLine;

  constructor(source: GeometryMultiLineSource<typeof GeometryMultiLine>) {
    super(source, GeometryMultiLine);
  }
}
