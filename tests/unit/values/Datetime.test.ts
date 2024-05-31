"use prelude";

import { Datetime, isDatetime } from "@tai-kun/surrealdb";
import { Datetime as FullyDatetime } from "@tai-kun/surrealdb/full";
import { Datetime as TinyDatetime } from "@tai-kun/surrealdb/tiny";

test("should check if a value is a datetime", () => {
  assert(isDatetime(new Datetime(0)));
  assert(isDatetime(new TinyDatetime(0)));
  assert(isDatetime(new FullyDatetime(0)));
  assert(!isDatetime(0));
  assert(!isDatetime({}));
  assert(!isDatetime(new Date(0)));
});

test("Datetime should be a subclass of Date", () => {
  assertInstanceOf(new Datetime(0), Date);
  assertInstanceOf(new TinyDatetime(0), Date);
  assertInstanceOf(new FullyDatetime(0), Date);
});

test("should get the seconds and nano seconds of a datetime", () => {
  for (
    const [value, [seconds, nanoseconds]] of [
      [0, [0, 0]],
      [1_000, [1, 0]],
      [1_00, [0, 100_000_000]],
      [[10, 0] as const, [10, 0]],
      [[1, 10] as const, [1, 10]],
    ] satisfies [any, [any, any]][]
  ) {
    const datetime = new Datetime(value);
    const copied = new Datetime(datetime);

    assertEquals(datetime.getSeconds(), seconds);
    assertEquals(datetime.getSeconds(), copied.getSeconds());
    assertEquals(datetime.getNanoseconds(), nanoseconds);
    assertEquals(datetime.getNanoseconds(), copied.getNanoseconds());
  }
});
