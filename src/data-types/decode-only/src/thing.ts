import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsThing } from "~/data-types/_internals/define";
import Uuid from "./uuid";

export type ThingTypes<U extends typeof Uuid = typeof Uuid> = {
  readonly Uuid: U;
};

export type ThingTbSource = DataItem.Utf8String.FixedLength["value"];

export type ThingIdSource<T extends ThingTypes = ThingTypes> =
  | DataItem.UnsignedInteger["value"]
  | DataItem.NegativeInteger["value"]
  | DataItem.Utf8String.FixedLength["value"]
  | readonly unknown[] // DataItem.Array
  | ReadonlyMap<unknown, unknown> // DataItem.Map
  | { readonly [p: string]: unknown } // DataItem.Map
  | InstanceType<T["Uuid"]>;

export type ThingSource<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> = readonly [
  tb: T,
  id: I,
];

export class ThingBase<
  S extends ThingTypes,
  T extends ThingTbSource,
  I extends ThingIdSource<S>,
> {
  readonly tb: T;
  readonly id: I;

  constructor(source: ThingSource<T, I>, protected readonly types: S) {
    [this.tb, this.id] = source;
    defineAsThing(this);
  }
}

export class Thing<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> extends ThingBase<ThingTypes, T, I> {
  static readonly Uuid = Uuid;

  constructor(source: ThingSource<T, I>) {
    super(source, Thing);
  }
}
