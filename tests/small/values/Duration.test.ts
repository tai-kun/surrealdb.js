import { isDuration } from "@tai-kun/surreal";
import { SurrealTypeError } from "@tai-kun/surreal/errors";
import { Duration } from "@tai-kun/surreal/values/full";
import { Duration as DurationStandard } from "@tai-kun/surreal/values/standard";
import { Duration as DurationTiny } from "@tai-kun/surreal/values/tiny";
import { assert, assertEquals, assertThrows } from "@tools/assert";
import { test } from "@tools/test";

for (
  const [input, expected, string] of [
    // simple
    ["0", [0, 0], "0ns"],
    [100, [0, 100_000_000], "100ms"],

    // composite durations
    [3141.5926, [3, 141_592_600], "3s141ms592µs600ns"],
    [1_000_001, [1_000, 1_000_000], "16m40s1ms"],
    ["1m1s1ns", [61, 1], "1m1s1ns"],

    // same units
    ["1s1s1s", [3, 0], "3s"],
  ] satisfies [any, [secs: number, nano: number], string][]
) {
  const [secs, nano] = expected;

  test(`${input} から Duration を作成する`, () => {
    const duration = new Duration(input);

    assertEquals(duration.seconds, secs);
    assertEquals(duration.nanoseconds, nano);
    assertEquals(duration.toSurql(), string);
    assertEquals(new Duration(string).toSurql(), string);
  });
}

for (
  const input of [
    "3.14s", // invalid value
    "3a", // invalid unit
    "1", // invalid format
  ] satisfies any[]
) {
  test(`${input} から Duration を作成するとエラーが投げられる`, () => {
    assertThrows(
      () => {
        new Duration(input);
      },
      SurrealTypeError,
    );
  });
}

test("Duration クラスであると判定できる", () => {
  assert(isDuration(new Duration(0)));
  assert(isDuration(new DurationTiny(0)));
  assert(isDuration(new DurationStandard(0)));

  assert(!isDuration(new Date()));
  assert(!isDuration({}));
  assert(!isDuration("0ns"));
});
