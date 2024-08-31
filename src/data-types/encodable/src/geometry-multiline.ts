import {
  GeometryMultiLineBase as Base,
  type GeometryMultiLineSource as GeometryMultiLineSourceBase,
  type GeometryMultiLineTypes as GeometryMultiLineTypesBase,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { type Coord, map } from "~/data-types/_internals/geometry";
import {
  type GeoJsonLineString,
  GeometryLine,
  type GeometryLineBase,
  type GeometryLineTypes,
} from "./geometry-line";
import type { GeometryPointBase, GeometryPointTypes } from "./geometry-point";
import { CBOR_TAG_GEOMETRY_MULTILINE, type Encodable } from "./spec";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

type LineBase = new(
  source: any,
) => GeometryLineBase<GeometryLineTypes<PointBase>>;

export type GeometryMultiLineTypes<L extends LineBase = LineBase> =
  GeometryMultiLineTypesBase<L>;

export type GeometryMultiLineSource<
  T extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> = GeometryMultiLineSourceBase<T>;

export type GeoJsonMultiLine = {
  type: "MultiLineString";
  // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.5
  // For type "MultiLineString", the "coordinates" member is an array of LineString coordinate arrays.
  coordinates: GeoJsonLineString["coordinates"][];
};

export class GeometryMultiLineBase<
  T extends GeometryMultiLineTypes = GeometryMultiLineTypes,
> extends Base<T> implements Encodable {
  get coordinates(): InstanceType<T["Line"]>["coordinates"][] {
    return map(this.lines, p => p.coordinates);
  }

  toCBOR(): [tag: typeof CBOR_TAG_GEOMETRY_MULTILINE, value: this["lines"]] {
    return [CBOR_TAG_GEOMETRY_MULTILINE, this.lines];
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

  structure() {
    return {
      type: this.type,
      lines: this.lines,
    };
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
