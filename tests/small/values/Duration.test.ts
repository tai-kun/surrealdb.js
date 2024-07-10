import { isDuration } from "@tai-kun/surreal";
import { SurrealTypeError } from "@tai-kun/surreal/errors";
import { Duration as DecodeOnlyDuration } from "@tai-kun/surreal/values/decode-only";
import { Duration as EncodableDuration } from "@tai-kun/surreal/values/encodable";
import { Duration } from "@tai-kun/surreal/values/full";
import { Duration as StandardDuration } from "@tai-kun/surreal/values/standard";
import assert from "@tools/assert";
import { describe, test } from "@tools/test";

const valid = Object.entries({
  0: {
    input: 0,
    structure: {
      seconds: 0n,
      nanoseconds: 0,
    },
    total: {
      ns: 0n,
      ms: 0,
    },
    string: "0ns",
    iso8601: "P0S",
  },
  "12345ns": {
    input: "12345ns",
    structure: {
      seconds: 0n,
      nanoseconds: 12_345,
    },
    total: {
      ns: 12_345n,
      ms: 0.012_345,
    },
    string: "12µs345ns",
    iso8601: "P0S",
  },
  "012345us": {
    input: "012345us",
    structure: {
      seconds: 0n,
      nanoseconds: 12_345_000,
    },
    total: {
      ns: 12_345_000n,
      ms: 12.345_000,
    },
    string: "12ms345µs",
    iso8601: "P0S",
  },
  "012345µs": {
    input: "012345µs",
    structure: {
      seconds: 0n,
      nanoseconds: 12_345_000,
    },
    total: {
      ns: 12_345_000n,
      ms: 12.345_000,
    },
    string: "12ms345µs",
    iso8601: "P0S",
  },
  "012345μs": {
    input: "012345μs",
    structure: {
      seconds: 0n,
      nanoseconds: 12_345_000,
    },
    total: {
      ns: 12_345_000n,
      ms: 12.345_000,
    },
    string: "12ms345µs",
    iso8601: "P0S",
  },
  "123456ms": {
    input: "123456ms",
    structure: {
      seconds: 123n,
      nanoseconds: 456_000_000,
    },
    total: {
      ns: 123_456_000_000n,
      ms: 123_456,
    },
    string: "2m3s456ms",
    iso8601: "P2M3S",
  },
  "3601s": {
    input: "3601s",
    structure: {
      seconds: 3601n,
      nanoseconds: 0,
    },
    total: {
      ns: 3_601_000_000_000n,
      ms: 3_601_000,
    },
    string: "1h1s",
    iso8601: "P1H1S",
  },
  "10000m": {
    input: "10000m",
    structure: {
      seconds: 600_000n,
      nanoseconds: 0,
    },
    total: {
      ns: 600_000_000_000_000n,
      ms: 600_000_000,
    },
    //  (6 * 24 * 60) + (22 * 60) + (40)
    // = 8_640        +  1_320    +  40
    // = 10_000
    string: "6d22h40m",
    iso8601: "P6D22H40M",
  },
  "90d": {
    input: "90d",
    structure: {
      seconds: 7_776_000n, // 90 * 24 * 60 * 60
      nanoseconds: 0,
    },
    total: {
      ns: 7_776_000_000_000_000n,
      ms: 7_776_000_000,
    },
    string: "12w6d",
    iso8601: "P12W6D",
  },
  "100w": {
    input: "100w",
    structure: {
      seconds: 60_480_000n, // 100 * 7 * 24 * 60 * 60
      nanoseconds: 0,
    },
    total: {
      ns: 60_480_000_000_000_000n,
      ms: 60_480_000_000,
    },
    //   ((1 * 365) + (47 * 7) + 6) / 7
    // = ( 365      +  329     + 6) / 7
    // = ( 365      +  335        ) / 7
    // =  700                       / 7
    // =  100
    string: "1y47w6d",
    iso8601: "P1Y47W6D",
  },
  "2y": {
    input: "2y",
    structure: {
      seconds: 63_072_000n,
      nanoseconds: 0,
    },
    total: {
      ns: 63_072_000_000_000_000n,
      ms: 63_072_000_000,
    },
    string: "2y",
    iso8601: "P2Y",
  },
  "1ns1us1ms1s1m": {
    input: "1ns1us1ms1s1m",
    structure: {
      seconds: 61n,
      nanoseconds: 1_001_001,
    },
    total: {
      ns: 61_001_001_001n,
      ms: 61_001.001_001,
    },
    string: "1m1s1ms1µs1ns",
    iso8601: "P1M1S",
  },
  "1ms1m": {
    input: "1ms1m",
    structure: {
      seconds: 60n,
      nanoseconds: 1_000_000,
    },
    total: {
      ns: 60_001_000_000n,
      ms: 60_001,
    },
    string: "1m1ms",
    iso8601: "P1M",
  },
  "1m1s1m1s1m1s": {
    input: "1m1s1m1s1m1s",
    structure: {
      seconds: 183n,
      nanoseconds: 0,
    },
    total: {
      ns: 183_000_000_000n,
      ms: 183_000,
    },
    string: "3m3s",
    iso8601: "P3M3S",
  },
  "1234.567890": {
    input: 1234.567890,
    structure: {
      seconds: 1n,
      nanoseconds: 234_567_890,
    },
    total: {
      ns: 1_234_567_890n,
      ms: 1_234.567_890,
    },
    string: "1s234ms567µs890ns",
    iso8601: "P1S",
  },
});

for (const [i, t] of valid) {
  test(`Duration に ${i} を入力`, () => {
    const d = new Duration(t.input);

    assert.deepEqual(d.structure(), t.structure, ".structure()");
    assert.deepEqual(
      d.getCompact(),
      [t.structure.seconds, t.structure.nanoseconds],
      ".getCompact()",
    );
    assert.deepEqual(d.valueOf(), t.total.ns, ".valueOf()");
    assert.deepEqual(+d, t.total.ms, "+duration");
    assert.deepEqual(`${d}`, t.string, "`${duration}`");
    assert.deepEqual(d.toJSON(), t.string, "JSON 表現");
    assert.deepEqual(d.toSurql(), t.string, "SurrealQL 表現");
    assert.deepEqual(d.toISOString(), t.iso8601, ".toISOString()");
  });
}

describe("Duration.MAX", () => {
  test("毎度異なるインスタンス", () => {
    assert.notEqual(Duration.MAX, Duration.MAX);
  });

  test("継承先のクラスを使ってインスタンスを作成する", () => {
    class MyDuration extends Duration {}

    assert(MyDuration.MAX instanceof MyDuration);
  });

  test("秒数は uint64 の最大値", () => {
    assert.equal(Duration.MAX.seconds, 2n ** 64n - 1n);
  });

  test("ナノ秒数は 999,999,999", () => {
    assert.equal(Duration.MAX.nanoseconds, 999_999_999);
  });

  test("年月日等をそれぞれ取得できる", () => {
    assert.equal(Duration.MAX.getYears(), 584942417355, ".getYears()");
    assert.equal(Duration.MAX.getWeeks(), 3, ".getWeeks()");
    assert.equal(Duration.MAX.getDays(), 5, ".getDays()");
    assert.equal(Duration.MAX.getHours(), 7, ".getHours()");
    assert.equal(Duration.MAX.getMinutes(), 0, ".getMinutes()");
    assert.equal(Duration.MAX.getSeconds(), 15, ".getSeconds()");
    assert.equal(Duration.MAX.getMilliseconds(), 999, ".getMilliseconds()");
    assert.equal(Duration.MAX.getMicroseconds(), 999, ".getMicroseconds()");
    assert.equal(Duration.MAX.getNanoseconds(), 999, ".getNanoseconds()");
  });
});

describe("Duration.ZERO", () => {
  test("毎度異なるインスタンス", () => {
    assert.notEqual(Duration.ZERO, Duration.ZERO);
  });

  test("継承先のクラスを使ってインスタンスを作成する", () => {
    class MyDuration extends Duration {}

    assert(MyDuration.ZERO instanceof MyDuration);
  });

  test("秒数は 0n", () => {
    assert.equal(Duration.ZERO.seconds, 0n);
  });

  test("ナノ秒数は 0", () => {
    assert.equal(Duration.ZERO.nanoseconds, 0);
  });

  test("年月日等をそれぞれ取得できる", () => {
    assert.equal(Duration.ZERO.getYears(), 0, ".getYears()");
    assert.equal(Duration.ZERO.getWeeks(), 0, ".getWeeks()");
    assert.equal(Duration.ZERO.getDays(), 0, ".getDays()");
    assert.equal(Duration.ZERO.getHours(), 0, ".getHours()");
    assert.equal(Duration.ZERO.getMinutes(), 0, ".getMinutes()");
    assert.equal(Duration.ZERO.getSeconds(), 0, ".getSeconds()");
    assert.equal(Duration.ZERO.getMilliseconds(), 0, ".getMilliseconds()");
    assert.equal(Duration.ZERO.getMicroseconds(), 0, ".getMicroseconds()");
    assert.equal(Duration.ZERO.getNanoseconds(), 0, ".getNanoseconds()");
  });
});

test("安全な Number であれば年月日等で表現されたミリ秒を取得できる", () => {
  const toFixed6 = (v: number) => Number(v.toFixed(6));

  const d = new Duration(365 * 24 * 60 * 60 * 1_000 + 0.123456);

  assert.equal(
    d.asYears(),
    toFixed6(1 + 0.123456 / 1_000 / 60 / 60 / 24 / 365),
    "years: " + d.asYears(),
  );
  assert.equal(
    d.asWeeks(),
    toFixed6(365 / 7 + 0.123456 / 1_000 / 60 / 60 / 24),
    "weeks: " + d.asWeeks(),
  );
  assert.equal(
    d.asDays(),
    toFixed6(365 + 0.123456 / 1_000 / 60 / 60 / 24),
    "days: " + d.asDays(),
  );
  assert.equal(
    d.asHours(),
    toFixed6(365 * 24 + 0.123456 / 1_000 / 60 / 60),
    "hours: " + d.asHours(),
  );
  assert.equal(
    d.asMinutes(),
    toFixed6(365 * 24 * 60 + 0.123456 / 1_000 / 60),
    "minutes: " + d.asMinutes(),
  );
  assert.equal(
    d.asSeconds(),
    toFixed6(365 * 24 * 60 * 60 + 0.123456 / 1_000),
    "seconds: " + d.asSeconds(),
  );
  assert.equal(
    d.asMilliseconds(),
    toFixed6(365 * 24 * 60 * 60 * 1_000 + 0.123456),
    "milliseconds: " + d.asMilliseconds(),
  );
  assert.equal(
    // やや同じ
    Math.floor(d.asMicroseconds()),
    Math.floor(365 * 24 * 60 * 60 * 1_000 * 1_000 + 123.456),
    "microseconds: " + d.asMicroseconds(),
  );
  assert.throws(
    () => {
      d.asNanoseconds();
    },
    SurrealTypeError,
    "オーバーフロー",
  );
});

test(".clone() で複製できる", () => {
  class MyDuration extends Duration {}

  const d1 = new MyDuration([123, 456]);
  const d2 = d1.clone();

  assert(d2 instanceof MyDuration, "継承先のクラスのインスタンスになる");
  assert.notEqual(d1, d2, "等価でない");
  assert.deepEqual(d1.structure(), d2.structure(), "値は同じ");
});

test("Duration クラスであると判定できる", () => {
  assert(isDuration(new DecodeOnlyDuration(0)), "DecodeOnlyDuration");
  assert(isDuration(new EncodableDuration(0)), "EncodableDuration");
  assert(isDuration(new StandardDuration(0)), "StandardDuration");
  assert(isDuration(new Duration(0)), "Duration");

  assert(!isDuration(new Date()));
  assert(!isDuration({}));
  assert(!isDuration(0));
  assert(!isDuration("0ns"));
});
