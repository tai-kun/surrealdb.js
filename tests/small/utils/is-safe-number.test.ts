import { isSafeNumber } from "@tai-kun/surrealdb/utils";
import { expect, test } from "vitest";

test.for([
  "123",
  NaN,
  Infinity,
  -Infinity,
  Number.MAX_VALUE,
])("%s は安全な数値ではない", value => {
  expect(isSafeNumber(value as any)).toBe(false);
});

test.for([
  123,
  Math.PI,
  Number.EPSILON,
  Number.MIN_VALUE,
])("%s は安全な数値である", value => {
  expect(isSafeNumber(value)).toBe(true);
});
