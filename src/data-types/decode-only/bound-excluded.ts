import { defineAsBoundExcluded } from "../_internals/define";
import type { ThingIdSource } from "./thing";

export type BoundExcludedSource = ThingIdSource;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-excluded)
 * @experimental
 */
export default class BoundExcluded<
  TValue extends BoundExcludedSource = BoundExcludedSource,
> {
  readonly value: TValue; // TODO(tai-kun): 要調査

  constructor(source: TValue) {
    this.value = source;
    defineAsBoundExcluded(this);
  }
}
