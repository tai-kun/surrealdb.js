import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsThing } from "../_internals/define";

export type ThingTbSource = DataItem.Utf8String.FixedLength["value"];

export type ThingIdSource =
  | DataItem.UnsignedInteger["value"]
  | DataItem.NegativeInteger["value"]
  | DataItem.Utf8String.FixedLength["value"]
  | object; // DataItem.Array, DataItem.Map, DataItem.Map, Uuid, Range

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

  constructor(source: ThingSource<T, I>) {
    [this.tb, this.id] = source;
    defineAsThing(this);
  }
}
