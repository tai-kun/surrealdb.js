import { SurrealTypeError } from "~/errors";
import { UINT_64_MAX } from "../_lib/duration";
import Base from "../standard/Duration";

const MAX_SAFE_INTEGER = /* @__PURE__ */ BigInt(Number.MAX_SAFE_INTEGER);

function assertMaxSafeInteger(v: bigint, d: number): void {
  if (v > MAX_SAFE_INTEGER || v === MAX_SAFE_INTEGER && d) {
    throw new SurrealTypeError("overflow");
  }
}

function toFixed6(v: number): number {
  return Number(v.toFixed(6));
}

export default class Duration extends Base {
  static get MAX() {
    return new this([UINT_64_MAX, 1e9 - 1]);
  }

  static get ZERO() {
    return new this(0);
  }

  static years(years: number) {
    return new this({ years });
  }

  static weeks(weeks: number) {
    return new this({ weeks });
  }

  static days(days: number) {
    return new this({ days });
  }

  static hours(hours: number) {
    return new this({ hours });
  }

  static minutes(minutes: number) {
    return new this({ minutes });
  }

  static seconds(seconds: number) {
    return new this({ seconds });
  }

  static milliseconds(milliseconds: number) {
    return new this({ milliseconds });
  }

  static microseconds(microseconds: number) {
    return new this({ microseconds });
  }

  static nanoseconds(nanoseconds: number) {
    return new this({ nanoseconds });
  }

  asYears(): number {
    return toFixed6(this.asDays() / 365);
  }

  asWeeks(): number {
    return toFixed6(this.asDays() / 7);
  }

  asDays(): number {
    return toFixed6(this.asHours() / 24);
  }

  asHours(): number {
    return toFixed6(this.asMinutes() / 60);
  }

  asMinutes(): number {
    return toFixed6(this.asSeconds() / 60);
  }

  asSeconds(): number {
    return toFixed6(this.asMilliseconds() / 1e3);
  }

  asMilliseconds(): number {
    const ms = this.seconds * 1_000n + BigInt(this.nanoseconds) / 1_000_000n;
    const us = (this.nanoseconds % 1e6) / 1e6;
    assertMaxSafeInteger(ms, us);

    return Number(ms) + us;
  }

  asMicroseconds(): number {
    const us = this.seconds * 1_000_000n + BigInt(this.nanoseconds) / 1_000n;
    const ns = (this.nanoseconds % 1e3) / 1e3;
    assertMaxSafeInteger(us, ns);

    return Number(us) + ns;
  }

  asNanoseconds(): number {
    const ns = this.seconds * 1_000_000_000n + BigInt(this.nanoseconds);
    assertMaxSafeInteger(ns, 0);

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
    // @ts-expect-error
    return new this.constructor(this);
  }
}
