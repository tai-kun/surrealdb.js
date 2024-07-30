import type { ThingSource } from "@tai-kun/surrealdb/data-types/decode-only";
import { Thing as Base } from "@tai-kun/surrealdb/data-types/encodable";

export interface ThingLike<T extends ThingSource[0] = ThingSource[0]> {
  readonly tb: T;
  readonly id: unknown;
}

export default class Thing<T extends ThingSource[0] = ThingSource[0]>
  extends Base<T>
{
  // @ts-expect-error readonly を外すだけ。
  tb: T;

  // @ts-expect-error readonly を外すだけ。
  id: unknown;

  constructor(value: ThingSource<T> | ThingLike<T>);

  constructor(...args: ThingSource<T>);

  constructor(...args: [ThingSource<T> | ThingLike<T>] | ThingSource<T>) {
    const value: readonly [T, any] = args.length === 2
      ? args
      : Array.isArray(args[0])
      ? args[0]
      : [args[0].tb, args[0].id];
    super(value);
  }

  clone(): this {
    const This = this.constructor as typeof Thing;

    return new This(this) as this;
  }
}
