import { map } from "@tai-kun/surreal/utils";
import GeometryAbc from "../../_shared/Geometry";
import { GeometryLine, type GeometryLineBase } from "./GeometryLine";

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryPolygonBase<L extends new(arg: any) => Line>
  extends GeometryAbc<"Polygon">
{
  protected readonly _geo: {
    readonly Line: L;
  };

  readonly polygon: readonly [InstanceType<L>, ...InstanceType<L>[]];

  constructor(
    geo: {
      readonly Line: L;
    },
    polygon:
      | readonly [ConstructorParameters<L>[0], ...ConstructorParameters<L>[0][]]
      | Readonly<Pick<GeometryPolygonBase<L>, "polygon">>,
  ) {
    super("Polygon");
    this._geo = geo;
    this.polygon = !Array.isArray(polygon)
      ? [...polygon.polygon]
      : map(
        polygon,
        (l: any) =>
          (l instanceof geo.Line ? l : new geo.Line(l)) as InstanceType<L>,
      );
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
