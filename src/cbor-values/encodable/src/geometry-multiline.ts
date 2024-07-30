import { GeometryMultiLineBase as Base } from "@tai-kun/surreal/cbor-values/decode-only";
import { toSurql } from "@tai-kun/surreal/utils";
import { map } from "~/cbor-values/geometry";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
} from "./geometry-line";
import { type Encodable, TAG_GEOMETRY_MULTILINE } from "./spec";

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

  toCBOR(): [tag: typeof TAG_GEOMETRY_MULTILINE, value: this["lines"]] {
    return [TAG_GEOMETRY_MULTILINE, this.lines];
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
