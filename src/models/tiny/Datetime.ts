import { _defineAssertDatetime } from "../internal";
import { isDatetime } from "../values";

/**
 * ミリ秒をナノ秒に変換します。
 *
 * @param ms - ミリ秒。
 * @returns ナノ秒。
 */
const ms2ns = (ms: number): number =>
  Number.isFinite(ms)
    ? ms * 1_000_000
    : NaN;

export default class Datetime extends Date {
  #ns: number = NaN;

  constructor();

  /**
   * @param value - 日付を表す文字列、1970 年 1 月 1 日 00:00:00 UTC からのミリ秒数を表す数値、
   * Date オブジェクト、または秒とナノ秒のペア。
   */
  constructor(
    value:
      | number
      | string
      | Date
      | readonly [seconds: number, nanoseconds: number],
  );

  /**
   * @param year - 世紀をまたぐ日付の精度を保つには、完全な `year` の指定が必要です。
   * `year` が 0 から 99 までの場合、1900 年 + `year` とみなされます。
   * @param monthIndex - 月は 0 から 11 までの数字で表されます (1 月から 12 月)。
   * @param date - 1 から 31 までの数字で表した日付。
   * @param hours - `minutes` を指定する場合は、これも指定する必要があります。時間を指定する 0 ～ 23 (午前 0 時～午後 11 時) の数値です。
   * @param minutes - `seconds` を指定する場合は、これも指定する必要があります。分数を指定する 0 ～ 59 の数値です。
   * @param seconds - `ms` を指定する場合は指定する必要があります。秒を指定する 0 ～ 59 の数値です。
   * @param ms - ミリ秒を指定する 0 ～ 999 の数値。
   */
  constructor(
    year: number,
    monthIndex: number,
    date?: number | undefined,
    hours?: number | undefined,
    minutes?: number | undefined,
    seconds?: number | undefined,
    ms?: number | undefined,
  );

  constructor(...args: any[]) {
    if (args.length === 0) {
      // @ts-expect-error
      super();
      const ms = this.getUTCMilliseconds();
      this.#ns = ms2ns(ms); // 整数のミリ秒からの変換では、ナノ秒の範囲を超えない。
    } else if (args.length === 1) {
      const [v] = args;

      if (Array.isArray(v)) {
        const [s, ns] = v;

        if (Number.isFinite(s) && Number.isFinite(ns)) {
          // dprint-ignore
          const nanoTime =
            BigInt(s)
            * 1_000_000_000n // 秒数をナノ秒に変換。
            + BigInt(ns); // ナノ秒を加算/減算。
          super(Number(nanoTime / 1_000_000n));
          this.#ns = Number(nanoTime.toString(10).slice(-9));
        } else {
          super(NaN); // To be invalid date
        }
      } else if (isDatetime(v)) {
        const [ms, ns] = [v.getTime(), v.getUTCNanoseconds()];

        if (Number.isFinite(ms) && Number.isFinite(ns)) {
          // dprint-ignore
          const nanoTime =
            BigInt(ms)
            * 1_000_000n // ミリ秒をナノ秒に変換。
            + BigInt(ns); // ナノ秒を加算/減算。
          super(Number(nanoTime / 1_000_000n));
          this.#ns = Number(nanoTime.toString(10).slice(-9));
        } else {
          super(NaN); // To be invalid date
        }
      } else if (
        (typeof v === "number" && Number.isFinite(v))
        || typeof v === "string"
        || v instanceof Date
      ) {
        super(v);
        const ms = this.getUTCMilliseconds();
        this.#ns = ms2ns(ms); // 整数のミリ秒からの変換では、ナノ秒の範囲を超えない。
      } else {
        super(NaN); // To be invalid date
      }
    } else {
      // @ts-expect-error
      super(...args);
      const ms = this.getUTCMilliseconds();
      this.#ns = ms2ns(ms); // 整数のミリ秒からの変換では、ナノ秒の範囲を超えない。
    }

    _defineAssertDatetime(this);
  }

  getUTCNanoseconds(): number {
    return this.#ns;
  }

  setUTCNanoseconds(ns: number): number {
    if (!Number.isFinite(ns)) {
      return super.setTime(NaN);
    }

    // dprint-ignore
    const nanoTime =
      BigInt(Math.trunc(this.getTime() / 1_000)) // 秒数に変換してミリ秒以下を切り捨て。
      * 1_000_000_000n // 秒数をナノ秒に変換。
      + BigInt(Math.trunc(ns)); // ナノ秒を加算/減算。
    this.#ns = Number(nanoTime.toString(10).slice(-9));

    return super.setTime(Number(nanoTime / 1_000_000n)); // ミリ秒に変換して設定。
  }

  override setTime(time: number): number {
    time = super.setTime(time);
    this.#ns = Number.isFinite(time)
      ? time % 1_000 * 1_000_000
      : NaN;

    return time;
  }

  override setMilliseconds(ms: number): number {
    const time = super.setMilliseconds(ms);
    this.#ns = ms2ns(super.getUTCMilliseconds());

    return time;
  }

  override setUTCMilliseconds(ms: number): number {
    const time = super.setUTCMilliseconds(ms);
    this.#ns = ms2ns(super.getUTCMilliseconds());

    return time;
  }

  override toISOString(): string {
    const Y = this.getUTCFullYear().toString(10);
    const M = (this.getUTCMonth() + 1).toString(10).padStart(2, "0");
    const D = this.getUTCDate().toString(10).padStart(2, "0");
    const h = this.getUTCHours().toString(10).padStart(2, "0");
    const m = this.getUTCMinutes().toString(10).padStart(2, "0");
    const s = this.getUTCSeconds().toString(10).padStart(2, "0");
    const ms = this.getUTCNanoseconds().toString(10).padStart(9, "0");

    return `${Y}-${M}-${D}T${h}:${m}:${s}.${ms}Z`;
  }
}
