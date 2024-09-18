import { BoundExcluded as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { CBOR_TAG_BOUND_EXCLUDED, type Encodable } from "./spec";

export type * from "../decode-only/bound-excluded";

/**
 * @experimental
 */
export default class BoundExcluded extends Base implements Encodable {
  override toString(): string {
    return String(this.value);
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_BOUND_EXCLUDED,
    value: unknown,
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
    return this.toString();
  }

  toPlainObject(): {
    value: unknown;
  } {
    return {
      value: this.value,
    };
  }
}
