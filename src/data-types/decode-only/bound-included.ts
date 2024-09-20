import { defineAsBoundIncluded } from "../_internals/define";

export type BoundIncludedSource = unknown;

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-included)
 * @experimental
 */
export default class BoundIncluded {
  readonly value: unknown; // TODO(tai-kun): 要調査

  constructor(source: BoundIncludedSource) {
    this.value = source;
    defineAsBoundIncluded(this);
  }
}
