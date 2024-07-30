import { GeometryPointBase as Base } from "@tai-kun/surreal/cbor-values/encodable";
import {
  type Coord,
  coord,
  type CoordArg,
  type CoordValue,
  isGeometryPoint,
  map,
} from "~/cbor-values/geometry";

function clone(v: unknown): unknown {
  return typeof v === "object" && v
      // @ts-expect-error
      && typeof v.clone === "function"
    // @ts-expect-error
    ? v.clone()
    : v;
}

export type { GeoJsonPoint } from "@tai-kun/surreal/cbor-values/encodable";

export class GeometryPointBase<C extends Coord> extends Base<C> {
  // @ts-expect-error readonly を外すだけ。
  override point: [
    x: CoordValue<C>,
    y: CoordValue<C>,
  ];

  override get x(): CoordValue<C> {
    return this.point[0];
  }

  override set x(v: CoordValue<C>) {
    this.point[0] = v;
  }

  override get y(): CoordValue<C> {
    return this.point[1];
  }

  override set y(v: CoordValue<C>) {
    this.point[1] = v;
  }

  override get coordinates(): [x: CoordValue<C>, y: CoordValue<C>] {
    return this.point;
  }

  override set coordinates(v: readonly [x: CoordArg<C>, y: CoordArg<C>]) {
    this.point = map(v, arg => coord(this._geo.Coord, arg));
  }

  clone(): this {
    // @ts-expect-error
    return new this.constructor(this._geo, {
      point: [clone(this.x), clone(this.y)],
    });
  }

  equals(other: unknown): boolean {
    return isGeometryPoint<GeometryPointBase<Coord>>(other)
      // TODO(tai-kun): 値の出し方を決めたい。
      && String(other.x) === String(this.x)
      && String(other.y) === String(this.y);
  }
}

export class GeometryPoint extends GeometryPointBase<typeof Number> {
  static get ZERO() {
    return new this([0, 0]);
  }

  static readonly Coord = Number;

  constructor(
    point:
      | readonly [x: unknown, y: unknown]
      | Readonly<Pick<GeometryPoint, "point">>,
  ) {
    super(GeometryPoint, point);
  }

  override clone(): this {
    // @ts-expect-error
    return new this.constructor({
      point: [clone(this.x), clone(this.y)],
    });
  }
}
