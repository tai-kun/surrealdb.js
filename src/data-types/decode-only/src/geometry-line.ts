import { defineAsGeometryLine } from "~/data-types/define";
import { type Coord, type Geometry, map } from "~/data-types/geometry";
import { GeometryPoint, type GeometryPointBase } from "./geometry-point";

type Point = GeometryPointBase<Coord>;

export class GeometryLineBase<P extends new(arg: any) => Point>
  implements Geometry
{
  protected readonly _geo: {
    readonly Point: P;
  };

  readonly type = "LineString" as const;

  readonly line: readonly [
    InstanceType<P>,
    InstanceType<P>,
    ...InstanceType<P>[],
  ];

  constructor(
    geo: {
      readonly Point: P;
    },
    line:
      | readonly [
        ConstructorParameters<P>[0],
        ConstructorParameters<P>[0],
        ...ConstructorParameters<P>[0][],
      ]
      | Readonly<Pick<GeometryLineBase<P>, "line">>,
  ) {
    this._geo = geo;
    this.line = !Array.isArray(line)
      ? [...line.line]
      : map(
        line,
        (p: any) =>
          (p instanceof geo.Point ? p : new geo.Point(p)) as InstanceType<P>,
      );
    defineAsGeometryLine(this);
  }
}

export class GeometryLine extends GeometryLineBase<typeof GeometryPoint> {
  static readonly Point = GeometryPoint;

  constructor(
    line:
      | readonly [
        ConstructorParameters<typeof GeometryPoint>[0],
        ConstructorParameters<typeof GeometryPoint>[0],
        ...ConstructorParameters<typeof GeometryPoint>[0][],
      ]
      | Readonly<Pick<GeometryLine, "line">>,
  ) {
    super(GeometryLine, line);
  }
}
