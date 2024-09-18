import { defineAsBoundIncluded } from "../_internals/define";

export type BoundIncludedSource = unknown;

/**
 * @experimental
 */
export default class BoundIncluded {
  readonly value: unknown; // TODO(tai-kun): 要調査

  constructor(source: BoundIncludedSource) {
    this.value = source;
    defineAsBoundIncluded(this);
  }
}
