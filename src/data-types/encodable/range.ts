import { RangeBase as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import BoundExcluded from "./bound-excluded";
import BoundIncluded from "./bound-included";
import { CBOR_TAG_RANGE, type Encodable } from "./spec";

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
export class RangeBase<TTypes extends RangeTypes = RangeTypes>
  extends Base<TTypes>
  implements Encodable
{
  override toString(): string {
    let s = "";

    if (this.begin) {
      s += this.begin.toString();
    }

    s += "..";

    if (this.end) {
      s += this.end.toString();
    }

    return s;
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_RANGE,
    value: [
      begin: InstanceType<TTypes["BoundIncluded"]> | null,
      end: InstanceType<TTypes["BoundExcluded"]> | null,
    ],
  ] {
    return [
      CBOR_TAG_RANGE,
      [
        this.begin,
        this.end,
      ],
    ];
  }

  toJSON(): string {
    return this.toString();
  }

  toSurql(): string {
    return this.toString();
  }

  toPlainObject(): {
    begin: InstanceType<TTypes["BoundIncluded"]> | null;
    end: InstanceType<TTypes["BoundExcluded"]> | null;
  } {
    return {
      begin: this.begin,
      end: this.end,
    };
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
