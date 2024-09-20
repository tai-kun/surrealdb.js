import {
  type GeoJsonMultiLineString,
  GeometryMultiLineBase as Base,
  type GeometryMultiLineSource as GeometryMultiLineSourceBase,
  type GeometryMultiLineTypes as GeometryMultiLineTypesBase,
} from "@tai-kun/surrealdb/data-types/encodable";
import { type Coord, isGeometryMultiLine, map } from "../_internals/geometry";
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

export type GeometryMultiLineTypes<TLine extends LineBase = LineBase> =
  GeometryMultiLineTypesBase<TLine>;

export type GeometryMultiLineSource<
  TTypes extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> = GeometryMultiLineSourceBase<TTypes>;

export type { GeoJsonMultiLineString };

export class GeometryMultiLineBase<
  TTypes extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> extends Base<TTypes> {
  // @ts-expect-error readonly を外すだけ。
  override lines: InstanceType<TTypes["Line"]>[];

  override get coordinates(): InstanceType<TTypes["Line"]>["coordinates"][] {
    return this.lines.map(l => l.coordinates);
  }

  override set coordinates(source: GeometryMultiLineSource<TTypes>) {
    this.lines = map(
      source,
      (l: any) =>
        (l instanceof this.types.Line
          ? l
          : new this.types.Line(l)) as InstanceType<TTypes["Line"]>,
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

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-multi-line)
 */
export class GeometryMultiLine
  extends GeometryMultiLineBase<GeometryMultiLineTypes<typeof GeometryLine>>
{
  static readonly Line = GeometryLine;

  constructor(source: GeometryMultiLineSource<typeof GeometryMultiLine>) {
    super(source, GeometryMultiLine);
  }
}
