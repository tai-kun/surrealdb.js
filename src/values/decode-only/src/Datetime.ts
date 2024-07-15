import { type Args, construct } from "../../_shared/Datetime";
import { _defineAsDatetime } from "../../_shared/define";

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
    [this.seconds, this.nanoseconds] = construct(args, new Date());
    _defineAsDatetime(this);
  }
}
