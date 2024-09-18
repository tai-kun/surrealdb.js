import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsThing } from "../_internals/define";

export type ThingTbSource = DataItem.Utf8String.FixedLength["value"];

export type ThingIdSource =
  | DataItem.UnsignedInteger["value"]
  | DataItem.NegativeInteger["value"]
  | DataItem.Utf8String.FixedLength["value"]
  | object; // DataItem.Array, DataItem.Map, DataItem.Map, Uuid, Range

export type ThingSource<
  TTb extends ThingTbSource = ThingTbSource,
  TId extends ThingIdSource = ThingIdSource,
> = readonly [
  tb: TTb,
  id: TId,
];

export default class Thing<
  TTb extends ThingTbSource = ThingTbSource,
  TId extends ThingIdSource = ThingIdSource,
> {
  readonly tb: TTb;
  readonly id: TId;

  constructor(source: ThingSource<TTb, TId>) {
    [this.tb, this.id] = source;
    defineAsThing(this);
  }
}
