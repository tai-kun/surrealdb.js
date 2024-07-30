import { defineAsGeometryPolygon } from "~/data-types/define";
import { type Geometry, map } from "~/data-types/geometry";
import { GeometryLine, type GeometryLineBase } from "./geometry-line";

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryPolygonBase<L extends new(arg: any) => Line>
  implements Geometry
{
  protected readonly _geo: {
    readonly Line: L;
  };

  readonly type = "Polygon" as const;

  readonly polygon: readonly [InstanceType<L>, ...InstanceType<L>[]];

  constructor(
    geo: {
      readonly Line: L;
    },
    polygon:
      | readonly [ConstructorParameters<L>[0], ...ConstructorParameters<L>[0][]]
      | Readonly<Pick<GeometryPolygonBase<L>, "polygon">>,
  ) {
    this._geo = geo;
    this.polygon = !Array.isArray(polygon)
      ? [...polygon.polygon]
      : map(
        polygon,
        (l: any) =>
          (l instanceof geo.Line ? l : new geo.Line(l)) as InstanceType<L>,
      );
    defineAsGeometryPolygon(this);
  }
}

export class GeometryPolygon extends GeometryPolygonBase<typeof GeometryLine> {
  static readonly Line = GeometryLine;

  constructor(
    polygon:
      | readonly [
        ConstructorParameters<typeof GeometryLine>[0],
        ...ConstructorParameters<typeof GeometryLine>[0][],
      ]
      | Readonly<Pick<GeometryPolygon, "polygon">>,
  ) {
    super(GeometryPolygon, polygon);
  }
}
