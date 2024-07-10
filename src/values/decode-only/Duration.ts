import isSafeNumber from "~/_lib/isSafeNumber";
import { SurrealTypeError, unreachable } from "~/errors";
import {
  NANOSECONDS_PER_MICROSECOND,
  NANOSECONDS_PER_MILLISECOND,
  NANOSECONDS_PER_SECONDS,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  SECONDS_PER_WEEK,
  SECONDS_PER_YEAR,
  UINT_64_MAX,
} from "../_lib/duration";
import { _defineAssertDuration } from "../_lib/internal";

// m の前に ms がマッチするようにする。
const DURATION_PART_REGEX = /^(\d+)((?:m|u|µ|μ|n)?s|m|h|d|w|y)/;

const isCompactPart = (v: unknown): v is number | bigint | undefined =>
  v === undefined
  || (typeof v === "bigint" && v >= 0n)
  || (typeof v === "number" && Number.isSafeInteger(v) && v >= 0);

const isCompact = (v: unknown): v is [
  seconds?: number | bigint | undefined,
  nanoseconds?: number | bigint | undefined,
] =>
  Array.isArray(v)
  && isCompactPart(v[0])
  && isCompactPart(v[1]);

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v
  && typeof v === "object";

const isDurationLike = (v: unknown): v is {
  readonly seconds: bigint;
  readonly nanoseconds: number;
} =>
  isObject(v)
  // seconds
  && typeof v["seconds"] === "bigint"
  && v["seconds"] >= 0n
  // nanoseconds
  && typeof v["nanoseconds"] === "number"
  && Number.isSafeInteger(v["nanoseconds"])
  && v["nanoseconds"] >= 0;

const OBJECT_PARAM_KEYS = [
  "years",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds",
  "microseconds",
  "nanoseconds",
] as const;

const isObjectParams = (v: unknown): v is {
  readonly years?: number | undefined;
  readonly weeks?: number | undefined;
  readonly days?: number | undefined;
  readonly hours?: number | undefined;
  readonly minutes?: number | undefined;
  readonly seconds?: number | undefined;
  readonly milliseconds?: number | undefined;
  readonly microseconds?: number | undefined;
  readonly nanoseconds?: number | undefined;
  readonly [key: string]: unknown;
} =>
  isObject(v)
  && OBJECT_PARAM_KEYS.every((key, i: unknown) =>
    (i = v[key]) === undefined
    || (typeof i === "number" && Number.isSafeInteger(i) && i >= 0)
  );

export default class Duration {
  protected _seconds: bigint;
  protected _nanoseconds: number;

  constructor(
    /**
     * @param duration 期間を表す文字列、ミリ秒を表す数値、秒とナノ秒のペア。
     */
    duration:
      | number
      | bigint
      | string
      | readonly [
        seconds?: number | bigint | undefined,
        nanoseconds?: number | bigint | undefined,
      ]
      | {
        readonly seconds: bigint;
        readonly nanoseconds: number;
      }
      | {
        readonly years?: number | undefined;
        readonly weeks?: number | undefined;
        readonly days?: number | undefined;
        readonly hours?: number | undefined;
        readonly minutes?: number | undefined;
        readonly seconds?: number | undefined;
        readonly milliseconds?: number | undefined;
        readonly microseconds?: number | undefined;
        readonly nanoseconds?: number | undefined;
      },
  ) {
    _defineAssertDuration(this);

    if (isCompact(duration)) {
      const [s = 0n, ns = 0n] = duration;
      [this._seconds, this._nanoseconds] = typeof ns === "bigint"
        ? [ns / NANOSECONDS_PER_SECONDS, Number(ns % NANOSECONDS_PER_SECONDS)]
        : [BigInt(Math.floor(ns / 1e9)), Math.floor(ns % 1e9)];
      this._seconds += typeof s === "bigint" ? s : BigInt(Math.floor(s));
    } else if (isDurationLike(duration)) {
      this._seconds = duration.seconds;
      this._nanoseconds = duration.nanoseconds;
    } else if (
      typeof duration === "number"
      && isSafeNumber(duration)
      && duration >= 0
    ) {
      this._seconds = BigInt(Math.floor(duration / 1e3));
      this._nanoseconds = Math.floor((duration % 1e3) * 1e6) % 1e9;
    } else if (
      typeof duration === "bigint"
      && duration >= 0n
    ) {
      this._seconds = duration / NANOSECONDS_PER_SECONDS;
      this._nanoseconds = Number(duration % NANOSECONDS_PER_SECONDS);
    } else if (
      typeof duration === "string"
      && duration.length < 1e3
    ) {
      if (duration === "" || duration === "0") {
        this._seconds = 0n;
        this._nanoseconds = 0;
      } else {
        let match: RegExpMatchArray | null,
          rest = duration,
          secs = 0n,
          nano = 0n,
          i: bigint;

        while (rest) {
          if (!(match = rest.match(DURATION_PART_REGEX))) {
            throw new SurrealTypeError("Invalid duration: invalid format");
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

        this._seconds = secs + nano / NANOSECONDS_PER_SECONDS;
        this._nanoseconds = Number(nano % NANOSECONDS_PER_SECONDS);
      }
    } else if (isObjectParams(duration)) {
      let i: bigint,
        temp: number | undefined,
        secs = 0n,
        nano = 0n;

      for (const unit of OBJECT_PARAM_KEYS) {
        if ((temp = duration[unit])) {
          i = BigInt(temp);

          switch (unit) {
            case "years":
              secs += i * SECONDS_PER_YEAR;
              break;

            case "weeks":
              secs += i * SECONDS_PER_WEEK;
              break;

            case "days":
              secs += i * SECONDS_PER_DAY;
              break;

            case "hours":
              secs += i * SECONDS_PER_HOUR;
              break;

            case "minutes":
              secs += i * SECONDS_PER_MINUTE;
              break;

            case "seconds":
              secs += i;
              break;

            case "milliseconds":
              nano += i * NANOSECONDS_PER_MILLISECOND;
              break;

            case "microseconds":
              nano += i * NANOSECONDS_PER_MICROSECOND;
              break;

            case "nanoseconds":
              nano += i;
              break;

            default:
              unreachable(unit);
          }
        }
      }

      this._seconds = secs + nano / NANOSECONDS_PER_SECONDS;
      this._nanoseconds = Number(nano % NANOSECONDS_PER_SECONDS);
    } else {
      throw new SurrealTypeError("Invalid duration: unexpected arguments");
    }

    if (
      !(this._seconds >= 0n
        && this._seconds <= UINT_64_MAX
        && this._nanoseconds >= 0
        && this._nanoseconds <= 1e9)
    ) {
      throw new SurrealTypeError("Invalid duration: unexpected arguments");
    }

    if (this._nanoseconds === 0) {
      this._nanoseconds = 0;
    }
  }

  get seconds(): bigint {
    return this._seconds;
  }

  get nanoseconds(): number {
    return this._nanoseconds;
  }
}
