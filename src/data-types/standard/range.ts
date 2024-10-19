import { RangeBase as Base } from "@tai-kun/surrealdb/encodable-datatypes";
import BoundExcluded from "./bound-excluded";
import BoundIncluded from "./bound-included";
import type { Standard } from "./spec";

type BoundIncludedBase = new(source: any) => BoundIncluded;
type BoundExcludedBase = new(source: any) => BoundExcluded;
type Bound<TTypes extends RangeTypes> =
  | InstanceType<TTypes["BoundIncluded"]>
  | InstanceType<TTypes["BoundExcluded"]>;

export type RangeTypes<
  TBoundIncluded extends BoundIncludedBase = BoundIncludedBase,
  TBoundExcluded extends BoundExcludedBase = BoundExcludedBase,
> = {
  readonly BoundIncluded: TBoundIncluded;
  readonly BoundExcluded: TBoundExcluded;
};

export type RangeSource<TTypes extends RangeTypes = RangeTypes> = readonly [
  begin: Bound<TTypes> | null,
  end: Bound<TTypes> | null,
];

/**
 * @experimental
 */
export class RangeBase<TTypes extends RangeTypes = RangeTypes>
  extends Base<TTypes>
  implements Standard
{
  // @ts-expect-error readonly を外すだけ
  begin: Bound<TTypes> | null;
  // @ts-expect-error readonly を外すだけ
  end: Bound<TTypes> | null;

  clone(): this {
    const This = this.constructor as typeof RangeBase<TTypes>;
    const begin = this.begin ? this.begin.clone() : null;
    const end = this.end ? this.end.clone() : null;

    return new This([begin, end], this.types) as this;
  }
}

/**
 * [API Reference](https://tai-kun.github.io/surrealdb.js/v2/api/data/range)
 * @experimental
 */
export class Range
  extends RangeBase<RangeTypes<typeof BoundIncluded, typeof BoundExcluded>>
{
  static readonly BoundIncluded = BoundIncluded;
  static readonly BoundExcluded = BoundExcluded;

  constructor(source: RangeSource<typeof Range>) {
    super(source, Range);
  }
}
