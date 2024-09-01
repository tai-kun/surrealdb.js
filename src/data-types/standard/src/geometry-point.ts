import {
  type GeoJsonPoint,
  GeometryPointBase as Base,
  type GeometryPointSource,
  type GeometryPointTypes,
} from "@tai-kun/surrealdb/data-types/encodable";
import {
  coord,
  type CoordValue,
  isGeometryPoint,
  map,
} from "../../_internals/geometry";

function clone<T>(v: T): T {
  return typeof v === "object" && v
      // @ts-expect-error
      && typeof v.clone === "function"
    // @ts-expect-error
    ? v.clone()
    : v;
}

export type { GeoJsonPoint, GeometryPointSource, GeometryPointTypes };

export class GeometryPointBase<T extends GeometryPointTypes> extends Base<T> {
  // @ts-expect-error readonly を外すだけ。
  override point: [
    x: CoordValue<T["Coord"]>,
    y: CoordValue<T["Coord"]>,
  ];

  override get x(): CoordValue<T["Coord"]> {
    return this.point[0];
  }

  override set x(v: CoordValue<T["Coord"]>) {
    this.point[0] = v;
  }

  override get y(): CoordValue<T["Coord"]> {
    return this.point[1];
  }

  override set y(v: CoordValue<T["Coord"]>) {
    this.point[1] = v;
  }

  override get coordinates(): [
    x: CoordValue<T["Coord"]>,
    y: CoordValue<T["Coord"]>,
  ] {
    return this.point;
  }

  override set coordinates(source: GeometryPointSource<T>) {
    this.point = map(source, arg => coord(this.types.Coord, arg));
  }

  clone(): this {
    const This = this.constructor as typeof GeometryPointBase;

    return new This([clone(this.x), clone(this.y)], this.types) as this;
  }

  equals(other: unknown): boolean {
    return isGeometryPoint<GeometryPointBase<GeometryPointTypes>>(other)
      // TODO(tai-kun): 値の出し方を決めたい。
      && String(other.x) === String(this.x)
      && String(other.y) === String(this.y);
  }
}

export class GeometryPoint
  extends GeometryPointBase<GeometryPointTypes<typeof Number>>
{
  static get ZERO() {
    return new this([0, 0]);
  }

  static readonly Coord = Number;

  constructor(source: GeometryPointSource<typeof GeometryPoint>) {
    super(source, GeometryPoint);
  }
}
