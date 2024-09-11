import { Datetime as Base } from "@tai-kun/surrealdb/data-types/decode-only";
import { quoteStr } from "@tai-kun/surrealdb/utils";
import { toISOString } from "../_internals/datetime";
import { CBOR_TAG_CUSTOM_DATETIME, type Encodable } from "./spec";

export type * from "../decode-only/datetime";

const MILLISECONDS_PER_SECOND = 1e3;
const NANOSECONDS_PER_MILLISECOND = 1e6;

export default class Datetime extends Base implements Encodable {
  override valueOf(): number {
    return this.seconds * MILLISECONDS_PER_SECOND
      + Math.floor(this.nanoseconds / NANOSECONDS_PER_MILLISECOND);
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
    return toISOString(this.toDate(), this.nanoseconds);
  }

  toDate(): Date {
    return new Date(this.valueOf());
  }

  toCBOR(): [
    tag: typeof CBOR_TAG_CUSTOM_DATETIME,
    value: [seconds: number, nanoseconds: number],
  ] {
    return [
      CBOR_TAG_CUSTOM_DATETIME,
      [this.seconds, this.nanoseconds],
    ];
  }

  toJSON(): string {
    return this.toISOString();
  }

  toSurql(): string {
    const iso = this.toISOString();

    // TODO(tai-kun): SurrealDB は拡張された年を扱えないため、ここでエラーを投げる必要がある。
    // if (iso[0] === "+" || iso[0] === "-") {
    //   throw new NumberRangeError();
    // }

    return "d" + quoteStr(iso);
  }

  toPlainObject(): {
    seconds: number;
    nanoseconds: number;
  } {
    return {
      seconds: this.seconds,
      nanoseconds: this.nanoseconds,
    };
  }
}
