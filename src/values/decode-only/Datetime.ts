import { type Args, init } from "../_lib/datetime";
import { _defineAssertDatetime } from "../_lib/internal";

export default class Datetime {
  readonly seconds: number;
  readonly nanoseconds: number;

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
    [this.seconds, this.nanoseconds] = init(args, new Date());
    _defineAssertDatetime(this);
  }
}
