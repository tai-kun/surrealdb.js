import {
  Duration as Base,
  type DurationSource,
} from "@tai-kun/surrealdb/data-types/encodable";
import {
  NumberRangeError,
  SurrealTypeError,
  SurrealValueError,
  unreachable,
} from "@tai-kun/surrealdb/errors";
import { isSafeNumber } from "@tai-kun/surrealdb/utils";

export type * from "../encodable/duration";

export interface DurationLike {
  seconds: bigint;
  nanoseconds: number;
}

// m の前に ms がマッチするようにする。
const DURATION_PART_REGEX = /^(\d+)((?:m|u|µ|μ|n)?s|m|h|d|w|y)/;

const SECONDS_PER_MINUTE = 60n;
const SECONDS_PER_HOUR = 60n * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24n * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7n * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365n * SECONDS_PER_DAY;
const NANOSECONDS_PER_MICROSECOND = 1_000n;
const NANOSECONDS_PER_MILLISECOND = 1_000_000n;
const NANOSECONDS_PER_SECOND = 1_000_000_000n;

const MAX_UINT_64 = 18446744073709551615n;

export default class Duration extends Base {
  static get MAX() {
    return new this([MAX_UINT_64, 1e9 - 1]);
  }

  static get ZERO() {
    return new this(0);
  }

  static years(years: number) {
    return new this(years + "y");
  }

  static weeks(weeks: number) {
    return new this(weeks + "w");
  }

  static days(days: number) {
    return new this(days + "d");
  }

  static hours(hours: number) {
    return new this(hours + "h");
  }

  static minutes(minutes: number) {
    return new this(minutes + "m");
  }

  static seconds(seconds: number) {
    return new this(seconds + "s");
  }

  static milliseconds(milliseconds: number) {
    return new this(milliseconds + "ms");
  }

  static microseconds(microseconds: number) {
    return new this(microseconds + "us");
  }

  static nanoseconds(nanoseconds: number) {
    return new this(nanoseconds + "ns");
  }

  constructor(
    value:
      | DurationSource
      | number
      | bigint
      | string
      | DurationLike,
  ) {
    let source: DurationSource | undefined;

    if (Array.isArray(value)) {
      source = value;
    } else {
      switch (typeof value) {
        case "number":
          if (isSafeNumber(value) && value >= 0) {
            source = [
              BigInt(Math.floor(value / 1e3)),
              Math.floor((value % 1e3) * 1e6) % 1e9,
            ];
          }

          break;

        case "bigint":
          source = [
            value / NANOSECONDS_PER_SECOND,
            Number(value % NANOSECONDS_PER_SECOND),
          ];
          break;

        case "string": {
          if (value === "" || value === "0" || value === "0ns") {
            source = [];
            break;
          }

          let match: RegExpMatchArray | null,
            rest = value,
            secs = 0n,
            nano = 0n,
            i: bigint;

          while (rest) {
            if (!(match = rest.match(DURATION_PART_REGEX))) {
              throw new SurrealValueError(
                `matches ${/^([0-9]+(ms|us|µs|μs|nss|m|h|d|w|y))+$/.source}`,
                value,
              );
            }

            i = BigInt(match[1]!);

            switch (match[2]) {
              case "y":
                secs += i * SECONDS_PER_YEAR;
                break;

              case "w":
                secs += i * SECONDS_PER_WEEK;
                break;

              case "d":
                secs += i * SECONDS_PER_DAY;
                break;

              case "h":
                secs += i * SECONDS_PER_HOUR;
                break;

              case "m":
                secs += i * SECONDS_PER_MINUTE;
                break;

              case "s":
                secs += i;
                break;

              case "ms":
                nano += i * NANOSECONDS_PER_MILLISECOND;
                break;

              case "us":
              case "µs":
              case "μs":
                nano += i * NANOSECONDS_PER_MICROSECOND;
                break;

              case "ns":
                nano += i;
                break;

              default:
                unreachable();
            }

            rest = rest.substring(match[0].length);
          }

          source = [
            secs + nano / NANOSECONDS_PER_SECOND,
            Number(nano % NANOSECONDS_PER_SECOND),
          ];
          break;
        }

        case "object":
          if (typeof value.seconds === "bigint") {
            source = [value.seconds, value.nanoseconds];
          }
      }
    }

    if (source === undefined) {
      throw new SurrealTypeError(
        ["Number", "BigInt", "String", "Array", "Object"],
        source,
      );
    }

    super(source);
  }

  override get seconds(): bigint {
    return this._seconds;
  }

  override set seconds(s: bigint) {
    if (typeof s === "bigint" && s >= 0n && s <= MAX_UINT_64) {
      this._seconds = s;
    } else {
      throw new NumberRangeError([0n, MAX_UINT_64], s, { integer: true });
    }
  }

  override get nanoseconds(): number {
    return this._nanoseconds;
  }

  override set nanoseconds(ns: number) {
    if (Number.isSafeInteger(ns) && ns >= 0) {
      this._nanoseconds = ns === 0 ? 0 : ns % 1e9;

      if (ns >= 1e9) {
        this.seconds += BigInt(Math.floor(ns / 1e9));
      }
    } else {
      throw new NumberRangeError([0, Number.MAX_SAFE_INTEGER], ns, {
        integer: true,
      });
    }
  }

  getCompact(): [seconds: bigint, nanoseconds: number] {
    return [this.seconds, this.nanoseconds];
  }

  setCompact(compact: readonly [seconds: bigint, nanoseconds: number]): void {
    this.seconds = compact[0];
    this.nanoseconds = compact[1];
  }

  getYears(): number {
    return this.parse()["years"] || 0;
  }

  addYears(years: number): void {
    this.seconds += BigInt(years) * SECONDS_PER_YEAR;
  }

  setYears(years: number): void {
    this.seconds -= BigInt(years) * SECONDS_PER_YEAR;
  }

  getWeeks(): number {
    return this.parse()["weeks"] || 0;
  }

  addWeeks(weeks: number): void {
    this.seconds += BigInt(weeks) * SECONDS_PER_WEEK;
  }

  setWeeks(weeks: number): void {
    this.seconds -= BigInt(weeks) * SECONDS_PER_WEEK;
  }

  getDays(): number {
    return this.parse()["days"] || 0;
  }

  addDays(days: number): void {
    this.seconds += BigInt(days) * SECONDS_PER_DAY;
  }

  setDays(days: number): void {
    this.seconds -= BigInt(days) * SECONDS_PER_DAY;
  }

  getHours(): number {
    return this.parse()["hours"] || 0;
  }

  addHours(hours: number): void {
    this.seconds += BigInt(hours) * SECONDS_PER_HOUR;
  }

  setHours(hours: number): void {
    this.seconds -= BigInt(hours) * SECONDS_PER_HOUR;
  }

  getMinutes(): number {
    return this.parse()["minutes"] || 0;
  }

  addMinutes(minutes: number): void {
    this.seconds += BigInt(minutes) * SECONDS_PER_MINUTE;
  }

  setMinutes(minutes: number): void {
    this.seconds -= BigInt(minutes) * SECONDS_PER_MINUTE;
  }

  getSeconds(): number {
    return this.parse()["seconds"] || 0;
  }

  addSeconds(seconds: number): void {
    this.seconds += BigInt(seconds);
  }

  setSeconds(seconds: number): void {
    this.seconds -= BigInt(seconds);
  }

  getMilliseconds(): number {
    return this.parse()["milliseconds"] || 0;
  }

  addMilliseconds(milliseconds: number): void {
    this.nanoseconds += milliseconds * 1e6;
  }

  setMilliseconds(milliseconds: number): void {
    this.nanoseconds -= milliseconds * 1e6;
  }

  getMicroseconds(): number {
    return this.parse()["microseconds"] || 0;
  }

  addMicroseconds(microseconds: number): void {
    this.nanoseconds += microseconds * 1e3;
  }

  setMicroseconds(microseconds: number): void {
    this.nanoseconds -= microseconds * 1e3;
  }

  getNanoseconds(): number {
    return this.parse()["nanoseconds"] || 0;
  }

  addNanoseconds(nanoseconds: number): void {
    this.nanoseconds += nanoseconds;
  }

  setNanoseconds(nanoseconds: number): void {
    this.nanoseconds -= nanoseconds;
  }

  asYears(): number {
    return this.asDays() / 365;
  }

  asWeeks(): number {
    return this.asDays() / 7;
  }

  asDays(): number {
    return this.asHours() / 24;
  }

  asHours(): number {
    return this.asMinutes() / 60;
  }

  asMinutes(): number {
    return this.asSeconds() / 60;
  }

  asSeconds(): number {
    return this.asMilliseconds() / 1e3;
  }

  asMilliseconds(): number {
    const ms = this.seconds * 1_000n + BigInt(this.nanoseconds) / 1_000_000n;
    const us = (this.nanoseconds % 1e6) / 1e6;

    return Number(ms) + us;
  }

  asMicroseconds(): number {
    const us = this.seconds * 1_000_000n + BigInt(this.nanoseconds) / 1_000n;
    const ns = (this.nanoseconds % 1e3) / 1e3;

    return Number(us) + ns;
  }

  asNanoseconds(): number {
    const ns = this.seconds * 1_000_000_000n + BigInt(this.nanoseconds);

    return Number(ns);
  }

  // ISO 8601 duration format
  // dprint-ignore
  toISOString(): string {
    const o = this.parse();
    let s = "P";

    if ("years"   in o) s += o.years   + "Y";
    if ("weeks"   in o) s += o.weeks   + "W";
    if ("days"    in o) s += o.days    + "D";
    if ("hours"   in o) s += o.hours   + "H";
    if ("minutes" in o) s += o.minutes + "M";
    if ("seconds" in o) s += o.seconds + "S";
    if (s === "P") s += "0S";

    return s
  }

  clone(): this {
    const This = this.constructor as typeof Duration;

    return new This(this) as this;
  }
}
