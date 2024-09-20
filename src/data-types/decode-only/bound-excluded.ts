import { defineAsBoundExcluded } from "../_internals/define";

export type BoundExcludedSource = unknown;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-excluded)
 * @experimental
 */
export default class BoundExcluded {
  readonly value: unknown; // TODO(tai-kun): 要調査

  constructor(source: BoundExcludedSource) {
    this.value = source;
    defineAsBoundExcluded(this);
  }
}
