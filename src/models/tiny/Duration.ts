import { TypeError } from "../../errors";
import { _defineAssertDuration } from "../internal";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;
const NANOSECONDS_PER_MILLISECOND = 1_000_000;
const NANOSECONDS_PER_MICROSECOND = 1_000;

export default class Duration {
  #s: number;
  #ns: number;

  constructor(
    /**
     * @param duration - 期間を表す文字列、ミリ秒を表す数値、秒とナノ秒のペア。
     */
    duration:
      | number
      | string
      | [seconds: number, ns: number],
  ) {
    _defineAssertDuration(this);

    if (typeof duration === "number" && Number.isFinite(duration)) {
      const [a, b] = duration.toString(10).split(".") as [string, string?];
      this.#s = Math.floor(Number(a) / 1_000);
      this.#ns = (Number(a) % 1_000) * NANOSECONDS_PER_MILLISECOND
        + Number((b ?? "").padEnd(6, "0").substring(0, 6));
    } else if (typeof duration === "string") {
      if (duration.length > 1_000) {
        throw new TypeError("Invalid duration: too long", { cause: duration });
      }

      if (duration === "" || duration === "0") {
        this.#s = 0;
        this.#ns = 0;
      } else {
        let regex = /(\d+)([a-zµμ]+)/g,
          match: RegExpExecArray | null,
          count = 0,
          secs = 0,
          nano = 0,
          i: number;

        while ((match = regex.exec(duration))) {
          i = Number(match[1]);

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
              throw new TypeError("Invalid duration: invalid unit", {
                cause: duration,
              });
          }

          count += match[0].length;
        }

        if (count !== duration.length) {
          throw new TypeError("Invalid duration: invalid format", {
            cause: duration,
          });
        }

        if (!Number.isSafeInteger(secs) || !Number.isSafeInteger(nano)) {
          throw new TypeError("Invalid duration: out of range", {
            cause: duration,
          });
        }

        this.#s = secs;
        this.#ns = nano;
      }
    } else if (
      Array.isArray(duration)
      && duration.length === 2
      && duration.every(v => typeof v === "number" && Number.isFinite(v))
    ) {
      this.#s = duration[0];
      this.#ns = duration[1];
    } else {
      throw new TypeError("Invalid duration: invalid type", {
        cause: duration,
      });
    }

    if (this.#s < 0 || this.#ns < 0) {
      throw new TypeError("Invalid duration: negative value", {
        cause: duration,
      });
    }
  }

  get seconds(): number {
    return this.#s;
  }

  get nanoseconds(): number {
    return this.#ns;
  }
}
