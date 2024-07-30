import { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsThing } from "~/data-types/define";

export type ThingSource<
  T extends DataItem.Utf8String.FixedLength["value"] =
    DataItem.Utf8String.FixedLength["value"],
> = readonly [
  tb: T,
  id:
    | DataItem.UnsignedInteger["value"]
    | DataItem.NegativeInteger["value"]
    | DataItem.Utf8String.FixedLength["value"]
    | readonly unknown[] // DataItem.Array
    | ReadonlyMap<unknown, unknown> // DataItem.Map
    | { readonly [key: string | number]: unknown }, // DataItem.Map
];

export default class Thing<T extends ThingSource[0] = ThingSource[0]> {
  readonly tb: T;

  readonly id: unknown;

  constructor(value: ThingSource<T>) {
    [this.tb, this.id] = value;
    defineAsThing(this);
  }
}
