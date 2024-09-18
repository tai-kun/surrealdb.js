import { Future as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { CBOR_TAG_FUTURE, type Encodable } from "./spec";

export type * from "../decode-only/future";

/**
 * @experimental
 */
export default class Future extends Base implements Encodable {
  override toString(): string {
    return this.block;
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_FUTURE,
    value: string,
  ] {
    return [
      CBOR_TAG_FUTURE,
      this.block, // TODO(tai-kun): エンコードした結果をキャッシュする。
    ];
  }

  toJSON(): string {
    return this.block;
  }

  toSurql(): string {
    return "<future>{" + this.block + "}";
  }

  toPlainObject(): {
    block: string;
  } {
    return {
      block: this.block,
    };
  }
}
