import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsThing } from "~/data-types/define";
// import type Uuid from "./uuid";

export type ThingTbSource = DataItem.Utf8String.FixedLength["value"];

// Uuid は https://github.com/surrealdb/surrealdb/pull/4491 がマージされてリリース
// されたら使って OK
// export type ThingIdSource<U extends Uuid = Uuid> =
//   | U
export type ThingIdSource =
  | DataItem.UnsignedInteger["value"]
  | DataItem.NegativeInteger["value"]
  | DataItem.Utf8String.FixedLength["value"]
  // DataItem.Array
  | readonly unknown[]
  // DataItem.Map
  | { readonly [p: string]: unknown }
  | ReadonlyMap<unknown, unknown>;

export type ThingSource<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> = readonly [
  tb: T,
  id: I,
];

export default class Thing<
  T extends ThingTbSource = ThingTbSource,
  I extends ThingIdSource = ThingIdSource,
> {
  readonly tb: T;

  readonly id: I;

  constructor(value: ThingSource<T, I>) {
    defineAsThing(this);
    [this.tb, this.id] = value;
  }
}
