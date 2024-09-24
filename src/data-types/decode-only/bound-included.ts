import { defineAsBoundIncluded } from "../_internals/define";
import type { ThingIdSource } from "./thing";

export type BoundIncludedSource = ThingIdSource;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-included)
 * @experimental
 */
export default class BoundIncluded<
  TValue extends BoundIncludedSource = BoundIncludedSource,
> {
  readonly value: TValue; // TODO(tai-kun): 要調査

  constructor(source: TValue) {
    this.value = source;
    defineAsBoundIncluded(this);
  }
}
