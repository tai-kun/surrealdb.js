import { GeometryPolygonBase as Base } from "../standard/GeometryPolygon";
import { GeometryLine, type GeometryLineBase } from "./GeometryLine";

export type * from "../standard/GeometryPolygon";

type Line = GeometryLineBase<new(_: any) => any>;

export class GeometryPolygonBase<L extends new(arg: any) => Line>
  extends Base<L>
{
  clone(): this {
    // @ts-expect-error
    return new this.constructor({
      polygon: this.polygon.map(l => l.clone()),
    });
  }

  equal(other: unknown): boolean {
    return other instanceof GeometryPolygonBase
      && other.polygon.length === this.polygon.length
      && other.polygon.every((l, i) => this.polygon[i]!.equal(l));
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
