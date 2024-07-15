import { map, toSurql } from "@tai-kun/surreal/utils";
import type { Encodable } from "../../_shared/types";
import { GeometryMultiLineBase as Base } from "../../decode-only/src/GeometryMultiLine";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
} from "./GeometryLine";

export type GeoJsonMultiLine = {
  type: "MultiLineString";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.5
  // For type "MultiLineString", the "coordinates" member is an array of LineString coordinate arrays.
  coordinates: GeoJsonLineString["coordinates"][];
};

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryMultiLineBase<P extends new(arg: any) => Line>
  extends Base<P>
  implements Encodable
{
  get coordinates(): InstanceType<P>["coordinates"][] {
    return map(this.lines, p => p.coordinates);
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
    lines: readonly InstanceType<P>[];
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
