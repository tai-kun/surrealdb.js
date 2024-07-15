import { isSafeNumber } from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { describe, test } from "@tools/test";

const safeNumbers = Object.entries({
  0: 0,
  1: 1,
  "Math.PI": Math.PI,
  "Number.EPSILON": Number.EPSILON,
  "Number.MIN_VALUE": Number.MIN_VALUE,
  "Number.MAX_SAFE_INTEGER": Number.MAX_SAFE_INTEGER,
  "-0": -0,
  "-1": -1,
  "-Math.PI": -Math.PI,
  "Number.MIN_SAFE_INTEGER": Number.MIN_SAFE_INTEGER,
  "365*24*60*60*1_000+0.123456780": 365 * 24 * 60 * 60 * 1_000 + 0.123456780,
});

const nonSafeNumbers = Object.entries({
  NaN: NaN,
  Infinity: Infinity,
  "Number.MAX_VALUE": Number.MAX_VALUE,
  "Number.MAX_SAFE_INTEGER + 1": Number.MAX_SAFE_INTEGER + 1,
  "-Infinity": -Infinity,
  "Number.MIN_SAFE_INTEGER - 1": Number.MIN_SAFE_INTEGER - 1,
  "1n": 1n,
  "''": "",
  "{}": {},
  "Symbol()": Symbol(),
  "function() {}": function() {},
  null: null,
  undefined: undefined,
});

describe("安全な数値であると判定する", () => {
  for (const [name, number] of safeNumbers) {
    test(name, () => {
      assert(isSafeNumber(number));
    });
  }
});

describe("安全な数値でないと判定する", () => {
  for (const [name, number] of nonSafeNumbers) {
    test(name, () => {
      assert(!isSafeNumber(number as any));
    });
  }
});
