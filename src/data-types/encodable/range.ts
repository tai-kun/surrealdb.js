import { RangeBase as Base } from "@tai-kun/surrealdb/decodeonly-datatypes";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { isBoundExcluded, isBoundIncluded } from "@tai-kun/surrealdb/utils";
import BoundExcluded from "./bound-excluded";
import BoundIncluded from "./bound-included";
import { CBOR_TAG_RANGE, type Encodable } from "./spec";

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
  implements Encodable
{
  override toString(): string {
    let s = "";

    if (isBoundExcluded(this.begin)) {
      s = ">";
    } else if (!isBoundIncluded(this.begin) && this.begin !== null) {
      throw new SurrealTypeError(
        ["BoundIncluded", "BoundExcluded", "null"],
        this.begin,
      );
    }

    if (this.begin) {
      s = this.begin.toString() + s;
    }

    s += "..";

    if (isBoundIncluded(this.end)) {
      s += "=";
    } else if (!isBoundExcluded(this.end) && this.end !== null) {
      throw new SurrealTypeError(
        ["BoundIncluded", "BoundExcluded", "null"],
        this.end,
      );
    }

    if (this.end) {
      s += this.end.toSurql();
    }

    return s;
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_RANGE,
    value: [
      begin: Bound<TTypes> | null,
      end: Bound<TTypes> | null,
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
    begin: Bound<TTypes> | null;
    end: Bound<TTypes> | null;
  } {
    return {
      begin: this.begin,
      end: this.end,
    };
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
