import toSurql from "~/index/toSurql";
import { GeometryAbc } from "../_lib/geometry";
import { map } from "../_lib/internal";
import type { Encodable } from "../_lib/types";
import type { GeoJsonMultiLine } from "../encodable/GeometryMultiLine";
import { GeometryLine, type GeometryLineBase } from "./GeometryLine";

export type * from "../encodable/GeometryMultiLine";

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryMultiLineBase<P extends new(arg: any) => Line>
  extends GeometryAbc<"MultiLineString">
  implements Encodable
{
  protected readonly _geo: {
    readonly Line: P;
  };

  lines: InstanceType<P>[];

  constructor(
    geo: {
      readonly Line: P;
    },
    lines:
      | readonly ConstructorParameters<P>[0][]
      | Readonly<Pick<GeometryMultiLineBase<P>, "lines">>,
  ) {
    super("MultiLineString");
    this._geo = geo;
    this.lines = !Array.isArray(lines)
      ? [...lines.lines]
      : map(
        lines,
        (p: any) =>
          (p instanceof geo.Line ? p : new geo.Line(p)) as InstanceType<P>,
      );
  }

  get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.lines, p => p.coordinates);
  }

  set coordinates(v: readonly ConstructorParameters<P>[0][]) {
    this.lines = map(
      v,
      (p: any) =>
        (p instanceof this._geo.Line
          ? p
          : new this._geo.Line(p)) as InstanceType<P>,
    );
  }

  toJSON(): GeoJsonMultiLine {
    return {
      type: this.type,
      coordinates: map(this.lines, p => p.toJSON().coordinates),
    };
  }

  toSurql(): string {
    return toSurql({
      type: this.type,
      coordinates: this.coordinates,
    });
  }

  structure(): {
    type: "MultiLineString";
    lines: InstanceType<P>[];
  } {
    return {
      type: this.type,
      lines: this.lines,
    };
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
