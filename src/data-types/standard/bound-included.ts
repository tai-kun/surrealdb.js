import {
  BoundIncluded as Base,
  type BoundIncludedSource,
} from "@tai-kun/surrealdb/data-types/encodable";

export type * from "../encodable/bound-included";

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/bound-included)
 * @experimental
 */
export default class BoundIncluded<
  TValue extends BoundIncludedSource = BoundIncludedSource,
> extends Base<TValue> {
  // @ts-expect-error readonly を外すだけ
  value: TValue;
}
