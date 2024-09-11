import {
  CBOR_TAG_CUSTOM_DATETIME,
  type DatetimeSource,
  type Encodable,
} from "@tai-kun/surrealdb/data-types/encodable";
import { SurrealValueError } from "@tai-kun/surrealdb/errors";
import { isSafeNumber, quoteStr } from "@tai-kun/surrealdb/utils";
import { toISOString } from "../_internals/datetime";
import { defineAsDatetime } from "../_internals/define";

export type * from "../encodable/datetime";

const MILLISECONDS_PER_SECOND = 1e3;
const NANOSECONDS_PER_SECOND = 1e9;

const NANOSECONDS_PER_SECOND_BIG = 1_000_000_000n;
const NANOSECONDS_PER_MILLISECOND_BIG = 1_000_000n;
const NANOSECONDS_PER_MICROSECOND_BIG = 1_000n;

const MAX_DATE_MILLISECONDS = 8_640_000_000_000_000;
const MIN_DATE_MILLISECONDS = -8_640_000_000_000_000;

const toBigInt = (v: number | bigint): bigint | null =>
  typeof v === "bigint"
    ? v
    : isSafeNumber(v)
    ? BigInt(Math.trunc(v))
    : null;

export interface DatetimeLike {
  readonly seconds: number;
  readonly nanoseconds: number;
}

export default class Datetime extends Date implements Encodable {
  protected _nanoseconds: number;

  protected processNsTime(nsTime: bigint | null | undefined): number {
    if (nsTime == null) {
      return super.setTime(NaN); // and returns NaN
    }

    let ns = Math.abs(Number(nsTime % NANOSECONDS_PER_SECOND_BIG));
    const msTime = super.setTime(
      Number(nsTime / NANOSECONDS_PER_MILLISECOND_BIG),
    );

    if (ns > 0) {
      if (msTime < 0) {
        ns = NANOSECONDS_PER_SECOND - ns;
      }

      // ミリ秒時刻が上限値/下限値なら、マイクロ秒以下は 0 より大きくなれない。
      if (msTime >= MAX_DATE_MILLISECONDS || msTime <= MIN_DATE_MILLISECONDS) {
        return super.setTime(NaN); // and returns NaN
      }
    }

    return msTime === msTime
      ? ns
      : NaN;
  }

  constructor(
    value?:
      | DatetimeSource
      | number
      | bigint
      | Date
      | DatetimeLike
      | undefined,
  );

  constructor(
    year: number,
    monthIndex: number,
    date?: number | undefined,
    hours?: number | undefined,
    minutes?: number | undefined,
    seconds?: number | undefined,
    milliseconds?: number | undefined,
    microseconds?: number | undefined,
    nanoseconds?: number | undefined,
  );

  constructor(
    ...args: [
      (
        | DatetimeSource
        | number
        | bigint
        | Date
        | DatetimeLike
        | undefined
      )?,
    ] | [
      number,
      number,
      (number | undefined)?,
      (number | undefined)?,
      (number | undefined)?,
      (number | undefined)?,
      (number | undefined)?,
      (number | undefined)?,
      (number | undefined)?,
    ]
  ) {
    super();

    if (args[0] === undefined) {
      const msTime = toBigInt(super.getTime());
      this._nanoseconds = msTime === null
        ? NaN
        : this.processNsTime(msTime * NANOSECONDS_PER_MILLISECOND_BIG);
    } else if (args.length === 1) {
      const v = args[0]!;
      let nsTime: bigint | undefined;

      if (Array.isArray(v)) {
        const s = toBigInt(v[0]);
        const ns = toBigInt(v[1]);

        if (s !== null && ns !== null) {
          nsTime = s * NANOSECONDS_PER_SECOND_BIG + ns;
        }
      } else if (
        typeof v === "object"
        && v
        && "seconds" in v
        && "nanoseconds" in v
      ) {
        const s = toBigInt(v.seconds);
        const ns = toBigInt(v.nanoseconds);

        if (s !== null && ns !== null) {
          nsTime = s * NANOSECONDS_PER_SECOND_BIG + ns;
        }
      } else if (
        typeof v === "string"
        || typeof v === "number"
        || v instanceof Date
      ) {
        const msTime = toBigInt(
          typeof v === "string"
            ? Date.parse(v)
            : typeof v === "number"
            ? v
            : v.getTime(),
        );

        if (msTime !== null) {
          nsTime = msTime * NANOSECONDS_PER_MILLISECOND_BIG;
        }
      } else {
        nsTime = v;
      }

      this._nanoseconds = this.processNsTime(nsTime);
    } else if (
      typeof args[0] === "number"
      && typeof args[1] === "number"
      && (() => {
        for (let i = 8, required = false; i >= 2; i--) {
          if (typeof args[i] === "number") {
            required = true;
          } else if (args[i] === undefined) {
            if (required) {
              return false;
            }
          } else {
            return false;
          }
        }

        return true;
      })()
    ) {
      const parts = args.filter(a => a !== undefined) as [any, any];
      const time = Date.UTC(...parts);
      const nsTimeOfMs = toBigInt(time);
      const nsTimeOfUs = toBigInt(args[7] ?? 0);
      const nsTimeOfNs = toBigInt(args[8] ?? 0);
      const nsTime =
        nsTimeOfMs === null || nsTimeOfUs === null || nsTimeOfNs === null
          ? null
          : (nsTimeOfMs * NANOSECONDS_PER_MILLISECOND_BIG)
            + (nsTimeOfUs * NANOSECONDS_PER_MICROSECOND_BIG)
            + nsTimeOfNs;

      this._nanoseconds = this.processNsTime(nsTime);
    } else {
      throw new SurrealValueError(
        "Date, BigInt, Array or Object arguments",
        String(args),
      );
    }

    defineAsDatetime(this);
  }

  get seconds(): number {
    let s = Math.trunc(super.getTime() / MILLISECONDS_PER_SECOND);

    if (s <= 0 && this._nanoseconds > 0) {
      s -= 1;
    }

    return s;
  }

  set seconds(s: number) {
    this.setCompact([s, this.nanoseconds]);
  }

  get nanoseconds(): number {
    return this._nanoseconds;
  }

  set nanoseconds(ns: number) {
    this.setCompact([this.seconds, ns]);
  }

  getCompact(): [seconds: number, nanoseconds: number] {
    return [this.seconds, this.nanoseconds];
  }

  setCompact(compact: readonly [seconds: number, nanoseconds: number]): number {
    const s = toBigInt(compact[0]);
    const ns = toBigInt(compact[1]);
    const nsTime = s !== null && ns !== null
      ? s * NANOSECONDS_PER_SECOND_BIG + ns
      : null;
    this._nanoseconds = this.processNsTime(nsTime);

    return super.getTime();
  }

  getMicroseconds(): number {
    return Math.trunc(this.nanoseconds / 1e3) % 1e3;
  }

  setMicroseconds(us: number): number {
    this.nanoseconds =
      // マイクロ秒 3 桁分を 0 にする。
      this.nanoseconds - this.getMicroseconds() * 1e3
      // 埋め直す。
      + us * 1e3;

    return this.getTime();
  }

  getUTCMicroseconds(): number {
    return this.getMicroseconds();
  }

  setUTCMicroseconds(us: number): number {
    return this.setMicroseconds(us);
  }

  getNanoseconds(): number {
    return this.nanoseconds % 1e3;
  }

  setNanoseconds(ns: number): number {
    this.nanoseconds =
      // ナノ秒 3 桁分を 0 にする。
      this.nanoseconds - this.getNanoseconds()
      // 埋め直す。
      + ns;

    return this.getTime();
  }

  getUTCNanoseconds(): number {
    return this.getNanoseconds();
  }

  setUTCNanoseconds(ns: number): number {
    return this.setNanoseconds(ns);
  }

  override setTime(time: number | bigint): number {
    if (typeof time === "number") {
      const msTime = super.setTime(time);
      const ns = msTime % 1e3 * 1e6;
      this._nanoseconds = msTime < 0 && ns > 0
        ? NANOSECONDS_PER_SECOND - ns
        : ns;
    } else {
      this._nanoseconds = this.processNsTime(time);
    }

    return super.getTime();
  }

  override setMilliseconds(ms: number): number {
    const time = super.setMilliseconds(ms);

    return this.setCompact([
      time / 1e3,
      time % 1e3 * 1e6 + this.nanoseconds % 1e6,
    ]);
  }

  override setUTCMilliseconds(ms: number): number {
    return this.setMilliseconds(ms);
  }

  override toISOString(): string {
    return toISOString(this, this.nanoseconds);
  }

  toDate(): Date {
    return new Date(this.seconds * 1e3 + this.nanoseconds / 1e6);
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_CUSTOM_DATETIME,
    value: [seconds: number, nanoseconds: number],
  ] {
    return [
      CBOR_TAG_CUSTOM_DATETIME,
      [this.seconds, this.nanoseconds],
    ];
  }

  override toJSON(): string {
    // super.toJSON() は無効な日付を null にしてしまうが、ここではエラーを投げるようにする。
    return this.toISOString();
  }

  toSurql(): string {
    const iso = this.toISOString();

    // TODO(tai-kun): SurrealDB は拡張された年を扱えないため、ここでエラーを投げる必要がある。
    // if (iso[0] === "+" || iso[0] === "-") {
    //   throw new NumberRangeError();
    // }

    return "d" + quoteStr(iso);
  }

  toPlainObject(): {
    seconds: number;
    nanoseconds: number;
  } {
    return {
      seconds: this.seconds,
      nanoseconds: this.nanoseconds,
    };
  }

  clone(): this {
    const This = this.constructor as typeof Datetime;

    return new This(this) as this;
  }
}
