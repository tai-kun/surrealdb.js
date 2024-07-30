import type { DataItem } from "@tai-kun/surrealdb/cbor";
import { NumberRangeError } from "@tai-kun/surrealdb/errors";
import { defineAsDuration } from "~/data-types/define";

export type DurationSource =
  // SurrealDB 独自
  // データ型は std::time::Duration に従う。
  // https://doc.rust-lang.org/stable/std/time/struct.Duration.html#method.new
  | readonly [
    // u64
    seconds?: DataItem.UnsignedInteger["value"] | undefined,
    // u32
    nanoseconds?: undefined,
  ]
  | readonly [
    // u64
    seconds: DataItem.UnsignedInteger["value"],
    // u32
    nanoseconds?:
      | DataItem.UnsignedInteger.Tiny["value"]
      | DataItem.UnsignedInteger.OneByte["value"]
      | DataItem.UnsignedInteger.TwoBytes["value"]
      | DataItem.UnsignedInteger.FourBytes["value"]
      | undefined,
  ];

const NANOSECONDS_PER_SECOND = 1_000_000_000n;

const MAX_UINT_64 = 18446744073709551615n;

export default class Duration {
  protected _seconds: bigint;

  protected _nanoseconds: number;

  constructor(value: DurationSource) {
    let [s = 0n, ns = 0n] = value;
    this._seconds = BigInt(s) + (ns = BigInt(ns)) / NANOSECONDS_PER_SECOND;
    this._nanoseconds = Number(ns % NANOSECONDS_PER_SECOND);
    defineAsDuration(this);

    if (this._seconds < 0n || this._seconds > MAX_UINT_64) {
      throw new NumberRangeError([0n, MAX_UINT_64], this._seconds, {
        integer: true,
      });
    }
  }

  get seconds(): bigint {
    return this._seconds;
  }

  get nanoseconds(): number {
    return this._nanoseconds;
  }
}
