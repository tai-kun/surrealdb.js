import { NumberRangeError } from "@tai-kun/surrealdb/errors";

const MAX_NANOSECONDS = 999_999_999;
const MAX_DATE_MILLISECONDS = 8_640_000_000_000_000;
const MIN_DATE_MILLISECONDS = -8_640_000_000_000_000;

export function toISOString(date: Date, nanoseconds: number): string {
  const y = date.getUTCFullYear();

  if (y !== y) {
    throw new NumberRangeError(
      [MIN_DATE_MILLISECONDS, MAX_DATE_MILLISECONDS],
      date.getTime(),
    );
  }

  if (nanoseconds === 0) {
    nanoseconds = 0; // -0 -> 0
  }

  if (nanoseconds < 0 || nanoseconds > MAX_NANOSECONDS) {
    throw new NumberRangeError([0, MAX_NANOSECONDS], nanoseconds);
  }

  const YYYY = y > 9999
    ? "+" + (y + "").padStart(6, "0")
    : y < 0
    ? "-" + (Math.abs(y) + "").padStart(6, "0")
    : (y + "").padStart(4, "0");
  const MM = (date.getUTCMonth() + 1 + "").padStart(2, "0");
  const DD = (date.getUTCDate() + "").padStart(2, "0");
  const HH = (date.getUTCHours() + "").padStart(2, "0");
  const mm = (date.getUTCMinutes() + "").padStart(2, "0");
  const ss = (date.getUTCSeconds() + "").padStart(2, "0");
  const s9 = (nanoseconds + "").padStart(9, "0");

  return YYYY + "-" + MM + "-" + DD
    + "T" + HH + ":" + mm + ":" + ss
    + "." + s9 + "Z";
}
