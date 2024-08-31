import { defineAsGeometryLine } from "~/data-types/_internals/define";
import {
  type Coord,
  type Geometry,
  map,
} from "~/data-types/_internals/geometry";
import {
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryLineTypes<P extends PointBase = PointBase> = {
  readonly Point: P;
};

export type GeometryLineSource<
  T extends GeometryLineTypes = GeometryLineTypes,
> = readonly [
  (ConstructorParameters<T["Point"]>[0] | InstanceType<T["Point"]>),
  (ConstructorParameters<T["Point"]>[0] | InstanceType<T["Point"]>),
  ...(ConstructorParameters<T["Point"]>[0] | InstanceType<T["Point"]>)[],
];

export class GeometryLineBase<T extends GeometryLineTypes> implements Geometry {
  readonly type = "LineString" as const;

  readonly line: readonly [
    InstanceType<T["Point"]>,
    InstanceType<T["Point"]>,
    ...InstanceType<T["Point"]>[],
  ];

  constructor(source: GeometryLineSource<T>, readonly types: T) {
    this.line = map(
      source,
      (p: any) =>
        (p instanceof types.Point
          ? p
          : new types.Point(p)) as InstanceType<T["Point"]>,
    );
    defineAsGeometryLine(this);
  }
}

export class GeometryLine
  extends GeometryLineBase<GeometryLineTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryLineSource<typeof GeometryLine>) {
    super(source, GeometryLine);
  }
}
