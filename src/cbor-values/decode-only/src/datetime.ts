import type { DataItem } from "@tai-kun/surreal/cbor";

// See: https://www.iana.org/assignments/cbor-tags/cbor-tags.xhtml
// SurrealDB では日時にタグ 100, 1, 1004 を使っていない模様
export type DatetimeSource =
  // Tag 0 (, 100)
  | DataItem.Utf8String.FixedLength["value"]
  // Tag (1, 1004)
  // | DataItem.UnsignedInteger["value"]
  // | DataItem.NegativeInteger["value"]
  // SurrealDB 独自
  | readonly [
    // i64
    seconds:
      | DataItem.UnsignedInteger["value"]
      | DataItem.NegativeInteger["value"],
    // u32
    nanoseconds:
      | DataItem.UnsignedInteger.Tiny["value"]
      | DataItem.UnsignedInteger.OneByte["value"]
      | DataItem.UnsignedInteger.TwoBytes["value"]
      | DataItem.UnsignedInteger.FourBytes["value"],
  ];

const MILLISECONDS_PER_SECOND = 1e3;
const NANOSECONDS_PER_MILLISECOND = 1e6;
const NANOSECONDS_PER_SECOND = 1e9;

const MAX_DATE_SECONDS = 8_640_000_000_000;
const MIN_DATE_SECONDS = -8_640_000_000_000;

export default class Datetime {
  /**
   * -(2^53-1) ~ 2^53-1, NaN
   */
  readonly seconds: number;

  /**
   * 0 ~ 999_999_999, NaN
   */
  readonly nanoseconds: number;

  constructor(value: DatetimeSource) {
    let s: number, ns: number;

    if (typeof value === "string") {
      const msTime = Date.parse(value);

      if (msTime === msTime) {
        s = Math.trunc(msTime / MILLISECONDS_PER_SECOND);
        ns = Math.abs(
          (msTime % MILLISECONDS_PER_SECOND) * NANOSECONDS_PER_MILLISECOND,
        );

        if (s <= 0 && ns > 0) {
          if (s <= MIN_DATE_SECONDS) {
            s = ns = NaN; // Underflow
          } else {
            s -= 1;
            ns = NANOSECONDS_PER_SECOND - ns;
          }
        }
      } else {
        s = ns = NaN;
      }
    } else {
      ns = value[1];
      s = Number(value[0]) + Math.trunc(ns / NANOSECONDS_PER_SECOND);

      if (s >= MIN_DATE_SECONDS && s <= MAX_DATE_SECONDS) {
        ns %= NANOSECONDS_PER_SECOND;
      } else {
        s = ns = NaN;
      }
    }

    this.seconds = s === 0 ? 0 : s;
    this.nanoseconds = ns === 0 ? ns : ns;
  }
}
