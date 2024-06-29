import type { SurqlValueSerializer } from "../../_values/Serializer";
import Base from "../../tiny/values/Duration";

const SECONDS_PER_MINUTE = 60n;
const SECONDS_PER_HOUR = 60n * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24n * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7n * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365n * SECONDS_PER_DAY;
const NANOSECONDS_PER_MILLISECOND = 1_000_000n;
const NANOSECONDS_PER_MICROSECOND = 1_000n;

export default class Duration extends Base implements SurqlValueSerializer {
  // dprint-ignore
  toJSON(): string {
    // https://github.com/surrealdb/surrealdb/blob/v1.5.2/core/src/sql/duration.rs#L159-L217

    // Split up the duration
    let secs = BigInt(this.seconds);
    let nano = BigInt(this.nanoseconds);

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

  toSurql(): string {
    return this.toJSON();
  }
}
