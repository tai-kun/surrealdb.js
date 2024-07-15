import { map } from "@tai-kun/surreal/utils";
import GeometryAbc, { type Coord } from "../../_shared/Geometry";
import { GeometryPoint, type GeometryPointBase } from "./GeometryPoint";

type Point = GeometryPointBase<Coord>;

export class GeometryLineBase<P extends new(arg: any) => Point>
  extends GeometryAbc<"LineString">
{
  protected readonly _geo: {
    readonly Point: P;
  };

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
    super("LineString");
    this._geo = geo;
    this.line = !Array.isArray(line)
      ? [...line.line]
      : map(
        line,
        (p: any) =>
          (p instanceof geo.Point ? p : new geo.Point(p)) as InstanceType<P>,
      );
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
