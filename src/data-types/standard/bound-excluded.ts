import {
  BoundExcluded as Base,
  type BoundExcludedSource,
} from "@tai-kun/surrealdb/encodable-datatypes";
import type { Standard } from "./spec";

export type * from "../encodable/bound-excluded";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-excluded)
 * @experimental
 */
export default class BoundExcluded<
  TValue extends BoundExcludedSource = BoundExcludedSource,
> extends Base<TValue> implements Standard {
  // @ts-expect-error readonly を外すだけ
  value: TValue;

  clone(): this {
    const This = this.constructor as typeof BoundExcluded<TValue>;

    return new This(this.value) as this;
  }
}
