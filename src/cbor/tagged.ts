import type { DataItem } from "./spec";
import type { ToCBOR } from "./traits";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/reference/cbor/tagged/)
 */
export default class Tagged<
  TValue = unknown,
  TTag extends DataItem.Tag["value"] = DataItem.Tag["value"],
> implements ToCBOR {
  constructor(
    public tag: TTag,
    public value: TValue,
  ) {}

  toCBOR(): [tag: TTag, value: TValue] {
    return [this.tag, this.value];
  }
}
