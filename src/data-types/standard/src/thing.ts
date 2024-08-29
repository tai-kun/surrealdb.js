import type {
  ThingIdSource as ThingIdSourceBase,
  ThingSource as ThingSourceBase,
  ThingTbSource,
  ThingTypes as ThingTypesBase,
  Uuid as UuidBase,
} from "@tai-kun/surrealdb/data-types/decode-only";
import { ThingBase as Base } from "@tai-kun/surrealdb/data-types/encodable";
import type { TableLike } from "./table";
import Uuid from "./uuid";

export type ThingTypes<U extends typeof UuidBase = typeof Uuid> =
  ThingTypesBase<U>;

export type { ThingTbSource };

export type ThingIdSource<T extends ThingTypesBase = ThingTypes> =
  ThingIdSourceBase<T>;

export type ThingSource<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSourceBase = ThingIdSource,
> = ThingSourceBase<T, I>;

export interface ThingLike<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSourceBase = ThingIdSource<ThingTypes>,
> {
  readonly tb: T;
  readonly id: I;
}

export class ThingBase<
  S extends ThingTypesBase,
  T extends ThingTbSource,
  I extends ThingIdSource<S>,
> extends Base<S, T, I> {
  // @ts-expect-error readonly を外すだけ。
  tb: T;
  // @ts-expect-error readonly を外すだけ。
  id: I;

  constructor(source: ThingSource<T, I> | ThingLike<T, I>, types: S);

  constructor(tb: T | TableLike<T>, id: I, types: S);

  constructor(
    ...args:
      | [ThingSource<T, I> | ThingLike<T, I>, types: S]
      | [tb: T | TableLike<T>, id: I, types: S]
  ) {
    const source: readonly [T, I] = args.length === 3
      ? [typeof args[0] === "string" ? args[0] : args[0].name, args[1]]
      : Array.isArray(args[0])
      ? args[0]
      : [args[0].tb, args[0].id];
    const types = args.length === 3
      ? args[2]
      : args[1];
    super(source, types);
  }

  clone(): this {
    const This = this.constructor as typeof ThingBase;

    return new This(this, this.types) as this;
  }
}

export class Thing<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> extends ThingBase<ThingTypes, T, I> {
  static readonly Uuid = Uuid;

  constructor(source: ThingSource<T, I> | ThingLike<T, I>);

  constructor(tb: T | TableLike<T>, id: I);

  constructor(
    ...args:
      | [ThingSource<T, I> | ThingLike<T, I>]
      | [tb: T | TableLike<T>, id: I]
  ) {
    // @ts-expect-error
    super(...args.concat([Thing]));
  }

  override clone(): this {
    const This = this.constructor as typeof Thing;

    return new This(this) as this;
  }
}
