import { defineAsBoundExcluded } from "../_internals/define";

export type BoundExcludedSource = unknown;

/**
 * @experimental
 */
export default class BoundExcluded {
  readonly value: unknown; // TODO(tai-kun): 要調査

  constructor(source: BoundExcludedSource) {
    this.value = source;
    defineAsBoundExcluded(this);
  }
}
