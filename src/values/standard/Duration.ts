import { SurrealTypeError } from "~/errors";
import {
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  SECONDS_PER_WEEK,
  SECONDS_PER_YEAR,
  UINT_64_MAX,
} from "../_lib/duration";
import Base from "../encodable/Duration";

export default class Duration extends Base {
  override get seconds(): bigint {
    return super.seconds;
  }

  override set seconds(s: bigint) {
    if (typeof s === "bigint" && s >= 0n && s <= UINT_64_MAX) {
      this._seconds = s;
    } else {
      throw new SurrealTypeError("range error");
    }
  }

  override get nanoseconds(): number {
    return super.nanoseconds;
  }

  override set nanoseconds(ns: number) {
    if (Number.isSafeInteger(ns) && ns >= 0) {
      this._nanoseconds = ns === 0 ? 0 : ns % 1e9;

      if (ns >= 1e9) {
        this.seconds += BigInt(Math.floor(ns / 1e9));
      }
    } else {
      throw new SurrealTypeError("range error");
    }
  }

  getCompact(): [seconds: bigint, nanoseconds: number] {
    return [this.seconds, this.nanoseconds];
  }

  setCompact(compact: readonly [seconds: bigint, nanoseconds: number]): this {
    this.seconds = compact[0];
    this.nanoseconds = compact[1];

    return this;
  }

  getYears(): number {
    return this.parse()["years"] || 0;
  }

  addYears(years: number): this {
    this.seconds += BigInt(years) * SECONDS_PER_YEAR;

    return this;
  }

  subYears(years: number): this {
    this.seconds -= BigInt(years) * SECONDS_PER_YEAR;

    return this;
  }

  getWeeks(): number {
    return this.parse()["weeks"] || 0;
  }

  addWeeks(weeks: number): this {
    this.seconds += BigInt(weeks) * SECONDS_PER_WEEK;

    return this;
  }

  subWeeks(weeks: number): this {
    this.seconds -= BigInt(weeks) * SECONDS_PER_WEEK;

    return this;
  }

  getDays(): number {
    return this.parse()["days"] || 0;
  }

  addDays(days: number): this {
    this.seconds += BigInt(days) * SECONDS_PER_DAY;

    return this;
  }

  subDays(days: number): this {
    this.seconds -= BigInt(days) * SECONDS_PER_DAY;

    return this;
  }

  getHours(): number {
    return this.parse()["hours"] || 0;
  }

  addHours(hours: number): this {
    this.seconds += BigInt(hours) * SECONDS_PER_HOUR;

    return this;
  }

  subHours(hours: number): this {
    this.seconds -= BigInt(hours) * SECONDS_PER_HOUR;

    return this;
  }

  getMinutes(): number {
    return this.parse()["minutes"] || 0;
  }

  addMinutes(minutes: number): this {
    this.seconds += BigInt(minutes) * SECONDS_PER_MINUTE;

    return this;
  }

  subMinutes(minutes: number): this {
    this.seconds -= BigInt(minutes) * SECONDS_PER_MINUTE;

    return this;
  }

  getSeconds(): number {
    return this.parse()["seconds"] || 0;
  }

  addSeconds(seconds: number): this {
    this.seconds += BigInt(seconds);

    return this;
  }

  subSeconds(seconds: number): this {
    this.seconds -= BigInt(seconds);

    return this;
  }

  getMilliseconds(): number {
    return this.parse()["milliseconds"] || 0;
  }

  addMilliseconds(milliseconds: number): this {
    this.nanoseconds += milliseconds * 1_000_000;

    return this;
  }

  subMilliseconds(milliseconds: number): this {
    this.nanoseconds -= milliseconds * 1_000_000;

    return this;
  }

  getMicroseconds(): number {
    return this.parse()["microseconds"] || 0;
  }

  addMicroseconds(microseconds: number): this {
    this.nanoseconds += microseconds * 1_000;

    return this;
  }

  subMicroseconds(microseconds: number): this {
    this.nanoseconds -= microseconds * 1_000;

    return this;
  }

  getNanoseconds(): number {
    return this.parse()["nanoseconds"] || 0;
  }

  addNanoseconds(nanoseconds: number): this {
    this.nanoseconds += nanoseconds;

    return this;
  }

  subNanoseconds(nanoseconds: number): this {
    this.nanoseconds -= nanoseconds;

    return this;
  }
}
