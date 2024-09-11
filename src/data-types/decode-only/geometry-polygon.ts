import { defineAsGeometryPolygon } from "../_internals/define";
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

export type GeometryPolygonTypes<L extends LineBase = LineBase> = {
  readonly Line: L;
};

export type GeometryPolygonSource<
  T extends GeometryPolygonTypes = GeometryPolygonTypes,
> = readonly [
  (ConstructorParameters<T["Line"]>[0] | InstanceType<T["Line"]>),
  ...(ConstructorParameters<T["Line"]>[0] | InstanceType<T["Line"]>)[],
];

export class GeometryPolygonBase<
  T extends GeometryPolygonTypes = GeometryPolygonTypes,
> implements Geometry {
  readonly type = "Polygon" as const;

  readonly polygon: readonly [
    InstanceType<T["Line"]>,
    ...InstanceType<T["Line"]>[],
  ];

  constructor(source: GeometryPolygonSource<T>, readonly types: T) {
    this.polygon = map(
      source,
      (l: any) =>
        (l instanceof types.Line
          ? l
          : new types.Line(l)) as InstanceType<T["Line"]>,
    );
    defineAsGeometryPolygon(this);
  }
}

export class GeometryPolygon
  extends GeometryPolygonBase<GeometryPolygonTypes<typeof GeometryLine>>
{
  static readonly Line = GeometryLine;

  constructor(source: GeometryPolygonSource<typeof GeometryPolygon>) {
    super(source, GeometryPolygon);
  }
}
