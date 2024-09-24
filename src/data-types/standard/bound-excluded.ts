import {
  BoundExcluded as Base,
  type BoundExcludedSource,
} from "@tai-kun/surrealdb/data-types/encodable";

export type * from "../encodable/bound-excluded";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-excluded)
 * @experimental
 */
export default class BoundExcluded<
  TValue extends BoundExcludedSource = BoundExcludedSource,
> extends Base<TValue> {
  // @ts-expect-error readonly を外すだけ
  value: TValue;
}
