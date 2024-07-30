import { defineAsGeometryMultiLine } from "~/data-types/define";
import { type Geometry, map } from "~/data-types/geometry";
import { GeometryLine, type GeometryLineBase } from "./geometry-line";

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryMultiLineBase<L extends new(arg: any) => Line>
  implements Geometry
{
  protected readonly _geo: {
    readonly Line: L;
  };

  readonly type = "MultiLineString" as const;

  readonly lines: readonly InstanceType<L>[];

  constructor(
    geo: {
      readonly Line: L;
    },
    lines:
      | readonly ConstructorParameters<L>[0][]
      | Readonly<Pick<GeometryMultiLineBase<L>, "lines">>,
  ) {
    this._geo = geo;
    this.lines = !Array.isArray(lines)
      ? [...lines.lines]
      : map(
        lines,
        (l: any) =>
          (l instanceof geo.Line ? l : new geo.Line(l)) as InstanceType<L>,
      );
    defineAsGeometryMultiLine(this);
  }
}

export class GeometryMultiLine
  extends GeometryMultiLineBase<typeof GeometryLine>
{
  static readonly Line = GeometryLine;

  constructor(
    lines:
      | readonly ConstructorParameters<typeof GeometryLine>[0][]
      | Readonly<Pick<GeometryMultiLine, "lines">>,
  ) {
    super(GeometryMultiLine, lines);
  }
}
