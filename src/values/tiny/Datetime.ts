import { _defineAssertDatetime, isDatetime } from "../utils";

const NANOSECONDS_PER_MILLISECOND = 1_000_000;
const NANOSECONDS_PER_MICROSECOND = 1_000;

/**
 * Converts milliseconds to seconds.
 *
 * @param ms - The number of milliseconds.
 * @returns The number of seconds.
 */
const ms2s = (ms: number): number =>
  Number.isFinite(ms)
    ? Math.floor(ms / NANOSECONDS_PER_MICROSECOND)
    : NaN;

/**
 * Converts milliseconds to nanoseconds.
 *
 * @param ms - The number of milliseconds.
 * @returns The number of nanoseconds.
 */
const ms2ns = (ms: number): number =>
  Number.isFinite(ms)
    ? (ms % NANOSECONDS_PER_MICROSECOND) * NANOSECONDS_PER_MILLISECOND
    : NaN;

/**
 * Converts nanoseconds to milliseconds.
 *
 * @param ns - The number of nanoseconds.
 * @returns The number of milliseconds.
 */
const ns2ms = (ns: number): number =>
  Number.isFinite(ns)
    ? Math.floor(ns / NANOSECONDS_PER_MILLISECOND)
    : NaN;

/**
 * A class representing a datetime. This class extends the `Date` class.
 */
export class Datetime extends Date {
  #ns: number = NaN;

  /**
   * Creates a new Datetime.
   */
  constructor();

  /**
   * Creates a new Datetime.
   *
   * @param value A string representing a date,
   * a number representing the number of milliseconds since January 1, 1970, 00:00:00 UTC,
   * a Date object, or an array of seconds and nanoseconds.
   */
  constructor(
    value:
      | number
      | string
      | Date
      | readonly [seconds: number, nanoseconds: number],
  );

  /**
   * Creates a new Datetime.
   *
   * @param year The full year designation is required for cross-century date accuracy. If year is between 0 and 99 is used, then year is assumed to be 1900 + year.
   * @param monthIndex The month as a number between 0 and 11 (January to December).
   * @param date The date as a number between 1 and 31.
   * @param hours Must be supplied if minutes is supplied. A number from 0 to 23 (midnight to 11pm) that specifies the hour.
   * @param minutes Must be supplied if seconds is supplied. A number from 0 to 59 that specifies the minutes.
   * @param seconds Must be supplied if milliseconds is supplied. A number from 0 to 59 that specifies the seconds.
   * @param ms A number from 0 to 999 that specifies the milliseconds.
   */
  constructor(
    year: number,
    monthIndex: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number,
  );

  constructor(...args: any) {
    if (Array.isArray(args[0])) {
      // @ts-expect-error
      super(0);
      this.setUTCSeconds(args[0][0]);
      this.setUTCNanoseconds(args[0][1]); // set this.#ns
    } else if (isDatetime(args[0])) {
      super(0);
      this.setUTCSeconds(ms2s(args[0].getTime()));
      this.setUTCNanoseconds(args[0].getUTCNanoseconds()); // set this.#ns
    } else {
      // @ts-expect-error
      super(...args);
      this.#ns = ms2ns(this.getTime());
    }

    _defineAssertDatetime(this);
  }

  override setUTCMilliseconds(ms: number): number {
    ms = super.setUTCMilliseconds(ms);
    this.#ns = ms2ns(ms);

    return ms;
  }

  override setMilliseconds(ms: number): number {
    ms = super.setMilliseconds(ms);
    this.#ns = ms2ns(ms);

    return ms;
  }

  override setTime(time: number): number {
    time = super.setTime(time);
    this.#ns = ms2ns(time);

    return time;
  }

  /**
   * If not a [valid value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_coercion) is passed as an argument,
   * it will be set to an [Invalid Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date) and return NaN.
   *
   * @param ns - The number of nanoseconds to set.
   * @returns The number of milliseconds since January 1, 1970, 00:00:00 UTC.
   */
  setUTCNanoseconds(ns: number): number {
    ns = Number(ns);

    if (!Number.isFinite(ns)) {
      return super.setTime(NaN);
    }

    ns = Math.floor(ns);

    if (Math.abs(ns) >= 1_000_000_000) {
      throw new RangeError(
        "The value of nanoseconds must be in the range -999,999,999 to 999,999,999.",
      );
    }

    this.#ns = ns;

    return super.setTime(this.getTime() + ns2ms(ns));
  }

  /**
   * If not a [valid value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_coercion) is passed as an argument,
   * it will be set to an [Invalid Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date) and return NaN.
   *
   * @param ns - The number of nanoseconds to set.
   * @returns The number of milliseconds since January 1, 1970, 00:00:00 UTC.
   */
  setNanoseconds(ns: number): number {
    return this.setUTCNanoseconds(ns);
  }

  /**
   * Returns the number of nanoseconds.
   *
   * @returns The number of nanoseconds.
   */
  getUTCNanoseconds(): number {
    return this.#ns;
  }

  /**
   * Returns the number of nanoseconds.
   *
   * @returns The number of nanoseconds.
   */
  getNanoseconds(): number {
    return this.getUTCNanoseconds();
  }
}
