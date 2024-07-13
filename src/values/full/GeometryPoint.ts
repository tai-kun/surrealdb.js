import type { Coord } from "../_lib/geometry";
import { GeometryPointBase as Base } from "../standard/GeometryPoint";

export type * from "../standard/GeometryPoint";

function clone(v: unknown): unknown {
  return typeof v === "object" && v
      // @ts-expect-error
      && typeof v.clone === "function"
    // @ts-expect-error
    ? v.clone()
    : v;
}

export class GeometryPointBase<C extends Coord> extends Base<C> {
  clone(): this {
    // @ts-expect-error
    return new this.constructor([clone(this.x), clone(this.y)]);
  }

  equal(other: unknown): boolean {
    return other instanceof GeometryPointBase
      // TODO(tai-kun): 値の出し方を決める。
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
}
