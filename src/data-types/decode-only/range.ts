import { defineAsRange } from "../_internals/define";
import BoundExcluded from "./bound-excluded";
import BoundIncluded from "./bound-included";

type BoundIncludedBase = new(source: any) => BoundIncluded;
type BoundExcludedBase = new(source: any) => BoundExcluded;

export type RangeTypes<
  TBoundIncluded extends BoundIncludedBase = BoundIncludedBase,
  TBoundExcluded extends BoundExcludedBase = BoundExcludedBase,
> = {
  readonly BoundIncluded: TBoundIncluded;
  readonly BoundExcluded: TBoundExcluded;
};

export type RangeSource<TTypes extends RangeTypes = RangeTypes> = readonly [
  begin: InstanceType<TTypes["BoundIncluded"]> | null,
  end: InstanceType<TTypes["BoundExcluded"]> | null,
];

/**
 * @experimental
 */
export class RangeBase<TTypes extends RangeTypes = RangeTypes> {
  readonly begin: InstanceType<TTypes["BoundIncluded"]> | null;
  readonly end: InstanceType<TTypes["BoundExcluded"]> | null;

  constructor(source: RangeSource<TTypes>, readonly types: TTypes) {
    [this.begin, this.end] = source;
    defineAsRange(this);
  }
}

/**
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
