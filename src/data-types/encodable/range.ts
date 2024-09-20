import { RangeBase as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { isDataTypeOf } from "@tai-kun/surrealdb/utils";
import { SurrealTypeError } from "src/errors/general";
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

    if (this.begin) {
      s += this.begin.toSurql();

      if (isDataTypeOf<BoundExcluded>(this.begin, "boundexcluded")) {
        s += ">";
      } else if (!isDataTypeOf(this.begin, "boundincluded")) {
        throw new SurrealTypeError(
          ["BoundIncluded", "BoundExcluded", "null"],
          this.begin,
        );
      }
    }

    s += "..";

    if (this.end) {
      if (isDataTypeOf<BoundIncluded>(this.end, "boundincluded")) {
        s += "=";
      } else if (!isDataTypeOf(this.end, "boundexcluded")) {
        throw new SurrealTypeError(
          ["BoundIncluded", "BoundExcluded", "null"],
          this.end,
        );
      }

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
