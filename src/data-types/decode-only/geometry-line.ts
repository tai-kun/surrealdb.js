import { defineAsGeometryLine } from "../_internals/define";
import { type Coord, type Geometry, map } from "../_internals/geometry";
import {
  GeometryPoint,
  type GeometryPointBase,
  type GeometryPointTypes,
} from "./geometry-point";

type PointBase = new(
  source: any,
) => GeometryPointBase<GeometryPointTypes<Coord>>;

export type GeometryLineTypes<TPoint extends PointBase = PointBase> = {
  readonly Point: TPoint;
};

export type GeometryLineSource<
  TTypes extends GeometryLineTypes = GeometryLineTypes,
> = readonly [
  (ConstructorParameters<TTypes["Point"]>[0] | InstanceType<TTypes["Point"]>),
  (ConstructorParameters<TTypes["Point"]>[0] | InstanceType<TTypes["Point"]>),
  ...(
    | ConstructorParameters<TTypes["Point"]>[0]
    | InstanceType<TTypes["Point"]>
  )[],
];

export class GeometryLineBase<TTypes extends GeometryLineTypes>
  implements Geometry
{
  readonly type = "LineString" as const;

  readonly line: readonly [
    InstanceType<TTypes["Point"]>,
    InstanceType<TTypes["Point"]>,
    ...InstanceType<TTypes["Point"]>[],
  ];

  constructor(source: GeometryLineSource<TTypes>, readonly types: TTypes) {
    this.line = map(
      source,
      (p: any) =>
        (p instanceof types.Point
          ? p
          : new types.Point(p)) as InstanceType<TTypes["Point"]>,
    );
    defineAsGeometryLine(this);
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/geometry-line)
 */
export class GeometryLine
  extends GeometryLineBase<GeometryLineTypes<typeof GeometryPoint>>
{
  static readonly Point = GeometryPoint;

  constructor(source: GeometryLineSource<typeof GeometryLine>) {
    super(source, GeometryLine);
  }
}
