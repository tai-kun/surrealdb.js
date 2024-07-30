import { GeometryMultiLineBase as Base } from "~/cbor-values/encodable";
import { isGeometryMultiLine, map } from "~/cbor-values/geometry";
import { GeometryLine, type GeometryLineBase } from "./geometry-line";

type Line = GeometryLineBase<new(_: any) => any>;

export type { GeoJsonMultiLine } from "@tai-kun/surreal/cbor-values/encodable";

export class GeometryMultiLineBase<P extends new(arg: any) => Line>
  extends Base<P>
{
  // @ts-expect-error readonly を外すだけ。
  override lines: InstanceType<P>[];

  override get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.lines, p => p.coordinates);
  }

  override set coordinates(v: readonly ConstructorParameters<P>[0][]) {
    this.lines = map(
      v,
      (p: any) =>
        (p instanceof this._geo.Line
          ? p
          : new this._geo.Line(p)) as InstanceType<P>,
    );
  }

  clone(): this {
    // @ts-expect-error
    return new this.constructor(this._geo, {
      lines: this.lines.map(p => p.clone()),
    });
  }

  equals(other: unknown): boolean {
    return isGeometryMultiLine<GeometryMultiLineBase<P>>(other)
      && other.lines.length === this.lines.length
      && other.lines.every((p, i) => this.lines[i]!.equals(p));
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

  override clone(): this {
    // @ts-expect-error
    return new this.constructor({
      lines: this.lines.map(p => p.clone()),
    });
  }
}
