import { SurrealTypeError } from "~/errors";
import { quoteStr } from "~/index/escape";
import { toISOString } from "../_lib/datetime";
import type { Encodable } from "../_lib/types";
import Base from "../decode-only/Datetime";

const toDate = (d: Readonly<Record<"seconds" | "nanoseconds", number>>) =>
  new Date(d.seconds * 1000 + d.nanoseconds / 1_000_000);

export default class Datetime extends Base implements Encodable {
  override valueOf(): number {
    return Math.trunc(this.seconds * 1000 + this.nanoseconds / 1_000_000);
  }

  override toString(): string {
    return toDate(this).toString();
  }

  [Symbol.toPrimitive](hint: "default" | "string"): string;
  [Symbol.toPrimitive](hint: "number"): number;
  [Symbol.toPrimitive](hint: string): string | number;
  [Symbol.toPrimitive](hint: string): string | number {
    return toDate(this)[Symbol.toPrimitive](hint);
  }

  toISOString(): string {
    const date = toDate(this);
    date.toISOString(); // エラーを投げることがある。

    return toISOString(date, this.nanoseconds);
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
