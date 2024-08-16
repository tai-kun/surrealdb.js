import type {
  ThingIdSource,
  ThingSource,
  ThingTbSource,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { Thing as Base } from "@tai-kun/surrealdb/data-types/encodable";
import type { TableLike } from "./table";

export interface ThingLike<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> {
  readonly tb: T;
  readonly id: I;
}

export default class Thing<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> extends Base<T> {
  // @ts-expect-error readonly を外すだけ。
  tb: T;

  // @ts-expect-error readonly を外すだけ。
  id: I;

  constructor(value: ThingSource<T, I> | ThingLike<T, I>);

  constructor(tb: T | TableLike<T>, id: I);

  constructor(
    ...args:
      | [ThingSource<T, I> | ThingLike<T, I>]
      | [tb: T | TableLike<T>, id: I]
  ) {
    const value: readonly [T, I] = args.length === 2
      ? [typeof args[0] === "string" ? args[0] : args[0].name, args[1]]
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
