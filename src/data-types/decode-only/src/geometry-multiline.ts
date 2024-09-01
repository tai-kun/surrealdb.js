import { defineAsGeometryMultiLine } from "../../_internals/define";
import { type Coord, type Geometry, map } from "../../_internals/geometry";
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

export type GeometryMultiLineTypes<L extends LineBase = LineBase> = {
  readonly Line: L;
};

export type GeometryMultiLineSource<
  T extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> = readonly (
  | ConstructorParameters<T["Line"]>[0]
  | InstanceType<T["Line"]>
)[];

export class GeometryMultiLineBase<
  T extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> implements Geometry {
  readonly type = "MultiLineString" as const;

  readonly lines: readonly InstanceType<T["Line"]>[];

  constructor(source: GeometryMultiLineSource<T>, readonly types: T) {
    this.lines = map(
      source,
      (l: any) =>
        (l instanceof types.Line
          ? l
          : new types.Line(l)) as InstanceType<T["Line"]>,
    );
    defineAsGeometryMultiLine(this);
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
