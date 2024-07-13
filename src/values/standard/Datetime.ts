import { SurrealTypeError } from "~/errors";
import { quoteStr } from "~/index/escape";
import {
  type Args,
  fromCompact,
  init,
  toCompact,
  toISOString,
} from "../_lib/datetime";
import { _defineAssertDatetime } from "../_lib/internal";
import type { Encodable } from "../_lib/types";

export default class Datetime extends Date implements Encodable {
  protected _nanoseconds: number;

  constructor();

  constructor(
    value:
      | number
      | bigint
      | string
      | Date
      | readonly [
        seconds?: number | undefined,
        nanoseconds?: number | undefined,
      ]
      | {
        readonly seconds: number;
        readonly nanoseconds: number;
      },
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

  constructor(...args: Args) {
    super();
    this._nanoseconds = init(args, {
      getTime: () => super.getTime(),
      setTime: t => super.setTime(t),
    })[1];
    _defineAssertDatetime(this);
  }

  get seconds(): number {
    const time = Math.trunc(super.getTime() / 1e3);

    return time === 0
      ? 0 // -0 を 0 にする
      : time;
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

  isInvalid(): boolean {
    return Number.isNaN(super.getTime());
  }

  getCompact(): [seconds: number, nanoseconds: number] {
    return [this.seconds, this.nanoseconds];
  }

  setCompact(compact: readonly [seconds: number, nanoseconds: number]): number {
    const [msTime, [, nanoseconds]] = fromCompact(compact);
    const time = super.setTime(msTime);
    this._nanoseconds = Number.isNaN(time)
      ? NaN
      : nanoseconds === 0
      ? 0 // -0 を 0 にする
      : nanoseconds;

    return time;
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
    return this.setCompact(toCompact(time));
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
    super.toISOString(); // エラーを投げることがある。

    return toISOString(this, this.nanoseconds);
  }

  override toJSON(): string {
    // super.toJSON() は無効な日付を null にしてしまうが、ここではエラーを投げるようにする。
    return this.toISOString();
  }

  toSurql(): string {
    const iso = this.toISOString();

    if (iso[0] === "+" || iso[0] === "-") {
      throw new SurrealTypeError("Unsupported extended year representation");
    }

    return "d" + quoteStr(iso);
  }

  structure(): {
    seconds: number;
    nanoseconds: number;
  } {
    return {
      seconds: this.seconds,
      nanoseconds: this.nanoseconds,
    };
  }
}
