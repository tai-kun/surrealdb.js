import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsFuture } from "../_internals/define";

export type FutureSource = DataItem.Utf8String.FixedLength["value"];

/**
 * @experimental
 */
export default class Future {
  readonly block: string;

  constructor(source: FutureSource) {
    this.block = source;
    defineAsFuture(this);
  }
}
