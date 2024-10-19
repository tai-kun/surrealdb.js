import {
  BoundExcluded as Base,
  type BoundExcludedSource,
} from "@tai-kun/surrealdb/decodeonly-datatypes";
import { toSurql } from "@tai-kun/surrealdb/utils";
import { CBOR_TAG_BOUND_EXCLUDED, type Encodable } from "./spec";

export type * from "../decode-only/bound-excluded";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-excluded)
 * @experimental
 */
export default class BoundExcluded<
  TValue extends BoundExcludedSource = BoundExcludedSource,
> extends Base<TValue> implements Encodable {
  override toString(): string {
    return String(this.value);
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_BOUND_EXCLUDED,
    value: TValue,
  ] {
    return [
      CBOR_TAG_BOUND_EXCLUDED,
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
    value: TValue;
  } {
    return {
      value: this.value,
    };
  }
}
