import {
  Thing as Base,
  type ThingIdSource,
  type ThingSource,
  type ThingTbSource,
} from "@tai-kun/surrealdb/data-types/encodable";
import type { TableLike } from "./table";

export type { ThingIdSource, ThingSource, ThingTbSource };

export default class Thing<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> extends Base<T, I> {
  // @ts-expect-error readonly を外すだけ。
  tb: T;
  // @ts-expect-error readonly を外すだけ。
  id: I;

  constructor(source: ThingSource<T, I>);

  constructor(tb: T | TableLike<T>, id: I);

  constructor(
    ...args:
      | [ThingSource<T, I>]
      | [tb: T | TableLike<T>, id: I]
  ) {
    const source: readonly [T, I] = args.length === 2
      ? [typeof args[0] === "string" ? args[0] : args[0].name, args[1]]
      : args[0];
    super(source);
  }

  clone(): this {
    const This = this.constructor as typeof Thing;

    return new This(this.tb, this.id) as this;
  }
}
