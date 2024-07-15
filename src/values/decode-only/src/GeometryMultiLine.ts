import { map } from "@tai-kun/surreal/utils";
import GeometryAbc from "../../_shared/Geometry";
import { GeometryLine, type GeometryLineBase } from "./GeometryLine";

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryMultiLineBase<L extends new(arg: any) => Line>
  extends GeometryAbc<"MultiLineString">
{
  protected readonly _geo: {
    readonly Line: L;
  };

  readonly lines: readonly InstanceType<L>[];

  constructor(
    geo: {
      readonly Line: L;
    },
    lines:
      | readonly ConstructorParameters<L>[0][]
      | Readonly<Pick<GeometryMultiLineBase<L>, "lines">>,
  ) {
    super("MultiLineString");
    this._geo = geo;
    this.lines = !Array.isArray(lines)
      ? [...lines.lines]
      : map(
        lines,
        (l: any) =>
          (l instanceof geo.Line ? l : new geo.Line(l)) as InstanceType<L>,
      );
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
