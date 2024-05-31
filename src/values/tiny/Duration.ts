/**
 * @see https://github.com/surrealdb/surrealdb/blob/v1.5.0/core/src/sql/duration.rs
 * @module
 */

import { ValidationError } from "../../common/errors";
import { _defineAssertDuration } from "../utils";

const SECONDS_PER_MINUTE = 60n;
const SECONDS_PER_HOUR = 60n * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24n * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7n * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365n * SECONDS_PER_DAY;
const NANOSECONDS_PER_MILLISECOND = 1_000_000n;
const NANOSECONDS_PER_MICROSECOND = 1_000n;

/**
 * Parse a number of seconds into a tuple of seconds and nanoseconds.
 * If there are decimals, calculate as nanoseconds.
 *
 * @param secs - The number of seconds.
 * @returns A tuple of seconds and nanoseconds.
 */
function parseSecs(secs: number): [secs: bigint, nano: bigint] {
  const [part1, part2] = secs.toString(10).split(".") as [string, string?];

  return [
    BigInt(part1),
    part2 == null
      ? 0n
      : BigInt((part2 + "000000000").substring(0, 9)),
  ];
}

/**
 * Parse a number of milliseconds into a tuple of seconds and nanoseconds.
 *
 * @param millis - The number of milliseconds.
 * @returns A tuple of seconds and nanoseconds.
 */
function parseMillis(millis: number | bigint): [secs: bigint, nano: bigint] {
  if (typeof millis === "number") {
    return parseSecs(millis / 1_000);
  }

  return [
    millis / 1_000n,
    (millis % 1_000n) * NANOSECONDS_PER_MILLISECOND,
  ];
}

/**
 * Parse a duration string into a tuple of seconds and nanoseconds.
 *
 * @param duration - The duration string.
 * @returns A tuple of seconds and nanoseconds.
 */
function parseDuration(duration: string): [secs: bigint, nano: bigint] {
  if (duration.length > 1_000) {
    throw new ValidationError("Duration string is too long.");
  }

  duration = duration.replace(/\s+/g, ""); // trim whitespace

  if (duration === "") {
    throw new ValidationError("Duration string is empty.");
  }

  if (duration === "0") {
    return [0n, 0n];
  }

  let regex = /(\d+)([a-zµμ]+)/g,
    match: RegExpExecArray | null,
    count = 0,
    secs = 0n,
    nano = 0n,
    i: bigint;

  while ((match = regex.exec(duration))) {
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
        throw new ValidationError(`Invalid duration unit: "${match[2]}"`);
    }

    count += match[0].length;
  }

  if (count !== duration.length) {
    throw new ValidationError(
      `Invalid duration string: ${JSON.stringify(duration)}`,
    );
  }

  return [secs, nano];
}

/**
 * A class representing a duration.
 */
export class Duration {
  #seconds: bigint;
  #nanoseconds: bigint;

  /**
   * @param duration - The duration string or number of milliseconds, or the number of seconds and nanoseconds.
   */
  constructor(
    duration:
      | number
      | bigint
      | string
      | [seconds: number | bigint, nanoseconds: number | bigint],
  ) {
    _defineAssertDuration(this);

    if (Array.isArray(duration)) {
      this.#seconds = BigInt(duration[0]);
      this.#nanoseconds = BigInt(duration[1]);
    } else if (typeof duration === "string") {
      [this.#seconds, this.#nanoseconds] = parseDuration(duration);
    } else {
      [this.#seconds, this.#nanoseconds] = parseMillis(duration);
    }
  }

  /**
   * The number of seconds.
   */
  get seconds(): bigint {
    return this.#seconds;
  }

  set seconds(value: number | bigint) {
    if (typeof value === "number") {
      const [secs, nano] = parseSecs(value);
      this.#seconds = secs;
      this.#nanoseconds += nano;
    } else {
      this.#seconds = value;
    }
  }

  /**
   * The number of nanoseconds.
   */
  get nanoseconds(): bigint {
    return this.#nanoseconds;
  }

  set nanoseconds(value: number | bigint) {
    this.#nanoseconds = BigInt(value);
  }

  /**
   * Returns the string representation of the duration.
   */
  // dprint-ignore
  toString(): string {
    let secs = this.#seconds;
    let nano = this.#nanoseconds;

    // Ensure no empty output
    if (secs === 0n && nano === 0n) {
      return "0ns"
    }

    let str = "";

    // Calculate the total years
    let year = secs / SECONDS_PER_YEAR;
        secs = secs % SECONDS_PER_YEAR;
    // Calculate the total weeks
    let week = secs / SECONDS_PER_WEEK;
        secs = secs % SECONDS_PER_WEEK;
    // Calculate the total days
    let days = secs / SECONDS_PER_DAY;
        secs = secs % SECONDS_PER_DAY;
    // Calculate the total hours
    let hour = secs / SECONDS_PER_HOUR;
        secs = secs % SECONDS_PER_HOUR;
    // Calculate the total minutes
    let mins = secs / SECONDS_PER_MINUTE;
        secs = secs % SECONDS_PER_MINUTE;
    // Calculate the total milliseconds
    let msec = nano / NANOSECONDS_PER_MILLISECOND;
        nano = nano % NANOSECONDS_PER_MILLISECOND;
    // Calculate the total microseconds
    let usec = nano / NANOSECONDS_PER_MICROSECOND;
        nano = nano % NANOSECONDS_PER_MICROSECOND;

    // Write the different parts

    if (year > 0n) {
      str += `${year}y`;
    }

    if (week > 0n) {
      str += `${week}w`;
    }

    if (days > 0n) {
      str += `${days}d`;
    }

    if (hour > 0n) {
      str += `${hour}h`;
    }

    if (mins > 0n) {
      str += `${mins}m`;
    }

    if (secs > 0n) {
      str += `${secs}s`;
    }

    if (msec > 0n) {
      str += `${msec}ms`;
    }

    if (usec > 0n) {
      str += `${usec}µs`;
    }

    if (nano > 0n) {
      str += `${nano}ns`;
    }

    return str
  }

  /**
   * Returns the JSON representation of the duration.
   * This is the same as `toString`.
   */
  toJSON(): string {
    return this.toString();
  }
}
