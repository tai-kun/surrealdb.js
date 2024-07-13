import { GeometryMultiLineBase as Base } from "../standard/GeometryMultiLine";
import { GeometryLine, type GeometryLineBase } from "./GeometryLine";

export type * from "../standard/GeometryMultiLine";

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryMultiLineBase<P extends new(arg: any) => Line>
  extends Base<P>
{
  clone(): this {
    // @ts-expect-error
    return new this.constructor({
      lines: this.lines.map(p => p.clone()),
    });
  }

  equal(other: unknown): boolean {
    return other instanceof GeometryMultiLineBase
      && other.lines.length === this.lines.length
      && other.lines.every((p, i) => this.lines[i]!.equal(p));
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
