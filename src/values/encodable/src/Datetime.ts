import { SurrealTypeError } from "@tai-kun/surreal/errors";
import { quoteStr } from "@tai-kun/surreal/utils";
import { toISOString } from "../../_shared/Datetime";
import type { Encodable } from "../../_shared/types";
import Base from "../../decode-only/src/Datetime";

export default class Datetime extends Base implements Encodable {
  override valueOf(): number {
    return this.seconds * 1e3 + Math.trunc(this.nanoseconds / 1e6);
  }

  override toString(): string {
    return this.toDate().toString();
  }

  [Symbol.toPrimitive](hint: "default" | "string"): string;
  [Symbol.toPrimitive](hint: "number"): number;
  [Symbol.toPrimitive](hint: string): string | number;
  [Symbol.toPrimitive](hint: string): string | number {
    return this.toDate()[Symbol.toPrimitive](hint);
  }

  toISOString(): string {
    const date = this.toDate();
    date.toISOString(); // エラーを投げることがある。

    return toISOString(date, this.nanoseconds);
  }

  toDate(): Date {
    return new Date(this.seconds * 1e3 + this.nanoseconds / 1e6);
  }

  toJSON(): string {
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
