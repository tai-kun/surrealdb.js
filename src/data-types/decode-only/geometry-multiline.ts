import { defineAsGeometryMultiLine } from "../_internals/define";
import { type Coord, type Geometry, map } from "../_internals/geometry";
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

export type GeometryMultiLineTypes<TLine extends LineBase = LineBase> = {
  readonly Line: TLine;
};

export type GeometryMultiLineSource<
  TTypes extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> = readonly (
  | ConstructorParameters<TTypes["Line"]>[0]
  | InstanceType<TTypes["Line"]>
)[];

export class GeometryMultiLineBase<
  TTypes extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> implements Geometry {
  readonly type = "MultiLineString" as const;

  readonly lines: readonly InstanceType<TTypes["Line"]>[];

  constructor(source: GeometryMultiLineSource<TTypes>, readonly types: TTypes) {
    this.lines = map(
      source,
      (l: any) =>
        (l instanceof types.Line
          ? l
          : new types.Line(l)) as InstanceType<TTypes["Line"]>,
    );
    defineAsGeometryMultiLine(this);
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
