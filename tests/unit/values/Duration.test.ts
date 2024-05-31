"use prelude";

import { Duration as NormalDuration, isDuration } from "@tai-kun/surrealdb";
import { Duration } from "@tai-kun/surrealdb/full";
import { Duration as TinyDuration } from "@tai-kun/surrealdb/tiny";

test("should check if a value is a duration", () => {
  assert(isDuration(new Duration(0)));
  assert(isDuration(new TinyDuration(0)));
  assert(isDuration(new NormalDuration(0)));
  assert(!isDuration(0));
  assert(!isDuration({}));
  assert(!isDuration(new Date(0)));
});

for (
  const [ok, input, expected, string] of [
    // simple
    [1, "0", [0n, 0n], "0ns"],
    [1, 100, [0n, 100_000_000n], "100ms"],

    // composite durations
    [1, 3141.5926, [3n, 141_592_600n], "3s141ms592µs600ns"],
    [1, 1_000_001n, [1_000n, 1_000_000n], "16m40s1ms"],
    [1, "1m1s1ns", [61n, 1n], "1m1s1ns"],

    // same units
    [1, "1s1s1s", [3n, 0n], "3s"],

    // errors
    [0, "3.14s"], // invalid value
    [0, "3a"], // invalid unit
    [0, "1"], // invalid format
  ] satisfies (
    | [1, any, [secs: bigint, nano: bigint], string]
    | [0, any, never?, never?]
  )[]
) {
  if (ok) {
    const [secs, nano] = expected;

    test(`should to be ${secs}s and ${nano}ns from ${input}`, () => {
      const duration = new Duration(input);
      assertEquals(duration.seconds, secs);
      assertEquals(duration.nanoseconds, nano);
    });

    test(`should to be ${secs}s and ${nano}ns from ${string}`, () => {
      const duration = new Duration(string);
      assertEquals(duration.seconds, secs);
      assertEquals(duration.nanoseconds, nano);
    });

    test(`should to be ${string} from ${secs}s and ${nano}ns`, () => {
      const duration = new Duration([secs, nano]);
      assertEquals(duration.toString(), string);
    });
  } else {
    test(`should throw from ${input}`, () => {
      assertThrows(() => new Duration(input));
    });
  }
}
