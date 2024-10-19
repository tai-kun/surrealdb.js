import {
  BoundIncluded as Base,
  type BoundIncludedSource,
} from "@tai-kun/surrealdb/encodable-datatypes";
import type { Standard } from "./spec";

export type * from "../encodable/bound-included";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-included)
 * @experimental
 */
export default class BoundIncluded<
  TValue extends BoundIncludedSource = BoundIncludedSource,
> extends Base<TValue> implements Standard {
  // @ts-expect-error readonly を外すだけ
  value: TValue;

  clone(): this {
    const This = this.constructor as typeof BoundIncluded<TValue>;

    return new This(this.value) as this;
  }
}
