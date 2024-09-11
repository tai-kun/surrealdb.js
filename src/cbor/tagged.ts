import type { DataItem } from "./spec";
import type { ToCBOR } from "./traits";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/tagged/)
 */
export default class Tagged<T = unknown> implements ToCBOR {
  constructor(
    public tag: DataItem.Tag["value"],
    public value: T,
  ) {}

  toCBOR(): [tag: DataItem.Tag["value"], value: T] {
    return [this.tag, this.value];
  }
}
