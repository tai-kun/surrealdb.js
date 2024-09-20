import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { defineAsFuture } from "../_internals/define";

export type FutureSource = DataItem.Utf8String.FixedLength["value"];

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/future)
 * @experimental
 */
export default class Future {
  readonly block: string;

  constructor(source: FutureSource) {
    this.block = source;
    defineAsFuture(this);
  }
}
