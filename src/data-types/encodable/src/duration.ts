import { Duration as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { NumberRangeError } from "@tai-kun/surrealdb/errors";
import { CBOR_TAG_CUSTOM_DURATION, type Encodable } from "./spec";

export type * from "~/data-types/decode-only/src/duration";

const SECONDS_PER_MINUTE = 60n;
const SECONDS_PER_HOUR = 60n * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24n * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7n * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365n * SECONDS_PER_DAY;
const NANOSECONDS_PER_MICROSECOND = 1_000n;
const NANOSECONDS_PER_MILLISECOND = 1_000_000n;
const NANOSECONDS_PER_SECOND = 1_000_000_000n;

const JS_MAX_SAFE_UNSIGNED_INTEGER = 9007199254740991n; // 2^53-1

export default class Duration extends Base implements Encodable {
  // dprint-ignore
  parse(): {
    years?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
    microseconds?: number;
    nanoseconds?: number;
  } {
    // https://github.com/surrealdbdb/surrealdbdb/blob/v1.5.2/core/src/sql/duration.rs#L159-L217

    let secs = this.seconds;
    let nano = BigInt(this.nanoseconds);

    if (secs === 0n && nano === 0n) {
      return {
        nanoseconds: 0,
      }
    }

    let year = secs / SECONDS_PER_YEAR;
        secs = secs % SECONDS_PER_YEAR;
    let week = secs / SECONDS_PER_WEEK;
        secs = secs % SECONDS_PER_WEEK;
    let days = secs / SECONDS_PER_DAY;
        secs = secs % SECONDS_PER_DAY;
    let hour = secs / SECONDS_PER_HOUR;
        secs = secs % SECONDS_PER_HOUR;
    let mins = secs / SECONDS_PER_MINUTE;
        secs = secs % SECONDS_PER_MINUTE;
    let msec = nano / NANOSECONDS_PER_MILLISECOND;
        nano = nano % NANOSECONDS_PER_MILLISECOND;
    let usec = nano / NANOSECONDS_PER_MICROSECOND;
        nano = nano % NANOSECONDS_PER_MICROSECOND;

    const o: {
      years?: number
      weeks?: number
      days?: number
      hours?: number
      minutes?: number
      seconds?: number
      milliseconds?: number
      microseconds?: number
      nanoseconds?: number
    } = {}

    if (year) o.years        = Number(year);
    if (week) o.weeks        = Number(week);
    if (days) o.days         = Number(days);
    if (hour) o.hours        = Number(hour);
    if (mins) o.minutes      = Number(mins);
    if (secs) o.seconds      = Number(secs);
    if (msec) o.milliseconds = Number(msec);
    if (usec) o.microseconds = Number(usec);
    if (nano) o.nanoseconds  = Number(nano);

    return o
  }

  override valueOf(): bigint {
    return this.seconds * NANOSECONDS_PER_SECOND + BigInt(this.nanoseconds);
  }

  // dprint-ignore
  override toString(): string {
    // https://github.com/surrealdbdb/surrealdbdb/blob/v1.5.2/core/src/sql/duration.rs#L159-L217

    const o = this.parse();
    let s = "";

    if ("years"        in o) s += o.years        + "y";
    if ("weeks"        in o) s += o.weeks        + "w";
    if ("days"         in o) s += o.days         + "d";
    if ("hours"        in o) s += o.hours        + "h";
    if ("minutes"      in o) s += o.minutes      + "m";
    if ("seconds"      in o) s += o.seconds      + "s";
    if ("milliseconds" in o) s += o.milliseconds + "ms";
    if ("microseconds" in o) s += o.microseconds + "µs";
    if ("nanoseconds"  in o) s += o.nanoseconds  + "ns";

    return s
  }

  [Symbol.toPrimitive](hint: "default" | "string"): string;
  [Symbol.toPrimitive](hint: "number"): number;
  [Symbol.toPrimitive](hint: string): string | number;
  [Symbol.toPrimitive](hint: string): string | number {
    switch (hint) {
      case "number": {
        const ms = this.seconds * 1_000n
          + BigInt(this.nanoseconds) / 1_000_000n;

        if (ms > JS_MAX_SAFE_UNSIGNED_INTEGER || ms < 0n) {
          throw new NumberRangeError([0n, JS_MAX_SAFE_UNSIGNED_INTEGER], ms, {
            integer: true,
          });
        }

        return Number(ms) + (this.nanoseconds % 1e6) / 1e6;
      }

      case "string":
      case "default":
        return this.toString();

      default:
        throw TypeError("Invalid hint: " + String(hint));
    }
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_CUSTOM_DURATION,
    value: [seconds: bigint, nanoseconds: number],
  ] {
    return [
      CBOR_TAG_CUSTOM_DURATION,
      [this.seconds, this.nanoseconds],
    ];
  }

  toJSON(): string {
    return this.toString();
  }

  toSurql(): string {
    return this.toString();
  }

  toPlain(): {
    seconds: bigint;
    nanoseconds: number;
  } {
    return {
      seconds: this.seconds,
      nanoseconds: this.nanoseconds,
    };
  }
}
