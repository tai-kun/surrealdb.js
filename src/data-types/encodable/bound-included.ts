import { BoundIncluded as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { CBOR_TAG_BOUND_INCLUDED, type Encodable } from "./spec";

export type * from "../decode-only/bound-included";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-included)
 * @experimental
 */
export default class BoundIncluded extends Base implements Encodable {
  override toString(): string {
    return String(this.value);
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_BOUND_INCLUDED,
    value: unknown,
  ] {
    return [
      CBOR_TAG_BOUND_INCLUDED,
      this.value,
    ];
  }

  toJSON(): string {
    return this.toString();
  }

  toSurql(): string {
    return toSurql(this.value);
  }

  toPlainObject(): {
    value: unknown;
  } {
    return {
      value: this.value,
    };
  }
}