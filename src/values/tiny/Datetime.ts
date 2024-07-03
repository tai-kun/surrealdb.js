import { SurrealTypeError } from "~/errors";
import { isDatetime } from "~/index/values";
import { _defineAssertDatetime } from "../_lib/internal";

export default class Datetime extends Date {
  #s: number;
  #ns: number;

  constructor();

  constructor(
    value:
      | number
      | string
      | Date
      | readonly [seconds: number, nanoseconds: number],
  );

  constructor(
    year: number,
    monthIndex: number,
    date?: number | undefined,
    hours?: number | undefined,
    minutes?: number | undefined,
    seconds?: number | undefined,
    ms?: number | undefined,
    us?: number | undefined,
    ns?: number | undefined,
  );

  constructor(
    ...args:
      | []
      | [number | string | Date | readonly [number, number]]
      | [
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
    if (args.length === 0) {
      // @ts-expect-error
      super();
      // ミリ秒時刻を取得する。
      const t = super.getTime();
      // ミリ秒時刻から秒数の部分を取得する。
      this.#s = Math.trunc(t / 1_000);
      // ミリ秒時刻からナノ秒の上位 3 桁を取得し、下位 6 桁を 0 で埋め、ナノ秒時刻にする。
      this.#ns = t % 1_000 * 1_000_000;
    } else if (args.length === 1) {
      super();
      const [v] = args;

      if (typeof v === "number") {
        // ミリ秒時刻を設定して取得する。
        const t = super.setTime(v);
        // ミリ秒時刻から秒数の部分を取得する。
        this.#s = Math.trunc(t / 1_000);
        // ミリ秒時刻からナノ秒の上位 3 桁を取得し、下位 6 桁を 0 で埋め、ナノ秒時刻にする。
        this.#ns = t % 1_000 * 1_000_000;
      } else if (typeof v === "string") {
        // ミリ秒時刻を設定して取得する。
        const t = super.setTime(Date.parse(v));
        // ミリ秒時刻から秒数の部分を取得する。
        this.#s = Math.trunc(t / 1_000);
        // ミリ秒時刻からナノ秒の上位 3 桁を取得し、下位 6 桁を 0 で埋め、ナノ秒時刻にする。
        this.#ns = t % 1_000 * 1_000_000;
      } else if (isDatetime(v)) {
        // ミリ秒時刻を引き継ぐ。
        this.#s = v.seconds;
        // ナノ秒時刻を引き継ぐ。
        this.#ns = v.nanoseconds;
      } else if (v instanceof Date) {
        // ミリ秒時刻を設定して取得する。
        const t = super.setTime(v.getTime());
        // ミリ秒時刻から秒数の部分を取得する。
        this.#s = Math.trunc(t / 1_000);
        // ミリ秒時刻からナノ秒の上位 3 桁を取得し、下位 6 桁を 0 で埋め、ナノ秒時刻にする。
        this.#ns = t % 1_000 * 1_000_000;
      } else if (
        Array.isArray(v)
        && v.length === 2
        && v.every(i => typeof i === "number")
      ) {
        // 秒時刻とナノ秒時刻の秒時刻 (10 桁目以上) を合算して取得する。
        this.#s = Math.trunc(v[0] + v[1] / 1_000_000_000);
        // ナノ秒時刻のナノ秒時刻 (9 桁目以下) を取得する。
        this.#ns = Math.trunc(v[1]) % 1_000_000_000;
        // dprint-ignore
        super.setTime(
          // 秒時刻からミリ秒時刻 (下位 3 桁) を取得する。
          this.#s * 1_000
          // ナノ秒時刻からミリ秒時刻 (上位 3 桁) を取得する。
          + Math.trunc(this.#ns / 1_000_000),
        );
      } else {
        throw new SurrealTypeError("Invalid datetime");
      }
    } else if (
      typeof args[0] === "number"
      && typeof args[1] === "number"
      && (() => {
        let required = false;

        for (const i of [8, 7, 6, 5, 4, 3]) {
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
      super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
      const nt =
        // マイクロ秒をナノ秒時刻に変換する。
        Math.trunc(args[7] ?? 0) * 1_000
        // ナノ秒時刻を加算する。
        + Math.trunc(args[8] ?? 0);
      // ナノ秒時刻からミリ秒時刻 (6 桁目以上) を取得する。
      const mt = Math.trunc(nt / 1_000_000);
      // ミリ秒の現在時刻に、マイクロ秒とナノ秒がオーバーフローした分のミリ秒を加算する。
      const t = super.setTime(super.getTime() + mt);
      // ミリ秒時刻から秒数の部分を取得する。
      this.#s = Math.trunc(t / 1_000);
      this.#ns =
        // ミリ秒時刻からナノ秒の上位 3 桁を取得し、下位 6 桁を 0 で埋め、ナノ秒時刻にする。
        t % 1_000 * 1_000_000
        // ナノ秒時刻のマイクロ秒時刻以下 (6 桁目以下) を取得する。ミリ秒の部分は上記で取得済み。
        + nt % 1_000_000;
    } else {
      throw new SurrealTypeError("Invalid datetime");
    }

    _defineAssertDatetime(this);
  }

  get seconds(): number {
    return this.#s;
  }

  set seconds(value: number) {
    super.setTime(value * 1_000 + Math.trunc(this.#ns / 1_000_000));
    this.#s = value;
  }

  get nanoseconds(): number {
    return this.#ns;
  }

  set nanoseconds(value: number) {
    const t = super.setTime(this.#s * 1_000 + Math.trunc(value / 1_000_000));
    // ミリ秒時刻から秒数の部分を取得する。
    this.#s = Math.trunc(t / 1_000);
    this.#ns =
      // ミリ秒時刻からナノ秒の上位 3 桁を取得し、下位 6 桁を 0 で埋め、ナノ秒時刻にする。
      t % 1_000 * 1_000_000
      // ナノ秒時刻のマイクロ秒時刻以下 (6 桁目以下) を取得する。ミリ秒の部分は上記で取得済み。
      + value % 1_000_000;
  }

  getMicroseconds(): number {
    return Math.trunc(this.nanoseconds / 1_000) % 1_000;
  }

  getNanoseconds(): number {
    return this.nanoseconds % 1_000;
  }

  setMicroseconds(value: number): number {
    this.nanoseconds += value * 1_000;

    return this.getTime();
  }

  setNanoseconds(value: number): number {
    this.nanoseconds += value;

    return this.getTime();
  }

  getUTCMicroseconds(): number {
    return this.getMicroseconds();
  }

  getUTCNanoseconds(): number {
    return this.getNanoseconds();
  }

  setUTCMicroseconds(value: number): number {
    return this.setMicroseconds(value);
  }

  setUTCNanoseconds(value: number): number {
    return this.setNanoseconds(value);
  }

  override setTime(time: number): number {
    const t = super.setTime(time);
    // ミリ秒時刻から秒数の部分を取得する。
    this.#s = Math.trunc(t / 1_000);
    this.#ns =
      // ミリ秒時刻からナノ秒の上位 3 桁を取得し、下位 6 桁を 0 で埋め、ナノ秒時刻にする。
      t % 1_000 * 1_000_000
      // ナノ秒時刻のマイクロ秒時刻以下 (6 桁目以下) を取得し、ナノ秒時刻に加算する。
      + this.#ns % 1_000_000;

    return t;
  }

  override setMilliseconds(ms: number): number {
    const t = super.setMilliseconds(ms);
    // ミリ秒時刻から秒数の部分を取得する。
    this.#s = Math.trunc(t / 1_000);
    this.#ns =
      // ミリ秒時刻からナノ秒の上位 3 桁を取得し、下位 6 桁を 0 で埋め、ナノ秒時刻にする。
      t % 1_000 * 1_000_000
      // ナノ秒時刻のマイクロ秒時刻以下 (6 桁目以下) を取得し、ナノ秒時刻に加算する。
      + this.#ns % 1_000_000;

    return t;
  }

  override setUTCMilliseconds(ms: number): number {
    return this.setMilliseconds(ms);
  }

  override toISOString(): string {
    super.toISOString(); // 例外を投げることがある。
    const Y = this.getUTCFullYear().toString(10);
    const M = (this.getUTCMonth() + 1).toString(10).padStart(2, "0");
    const D = this.getUTCDate().toString(10).padStart(2, "0");
    const h = this.getUTCHours().toString(10).padStart(2, "0");
    const m = this.getUTCMinutes().toString(10).padStart(2, "0");
    const s = this.getUTCSeconds().toString(10).padStart(2, "0");
    const ms = this.nanoseconds.toString(10).padStart(9, "0");

    return `${Y}-${M}-${D}T${h}:${m}:${s}.${ms}Z`;
  }
}
