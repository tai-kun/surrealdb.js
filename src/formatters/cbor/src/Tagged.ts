import type { DataItem } from "./spec";
import type { ToCBOR } from "./Writer";

export default class Tagged<T = unknown> implements ToCBOR {
  constructor(
    readonly tag: DataItem.Tag["value"],
    readonly value: T,
  ) {}

  toCBOR(): [tag: DataItem.Tag["value"], value: T] {
    return [this.tag, this.value];
  }
}
