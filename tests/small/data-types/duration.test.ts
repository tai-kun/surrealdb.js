import { isDuration } from "@tai-kun/surrealdb";
import { decode, encode } from "@tai-kun/surrealdb/cbor";
import { CBOR_TAG_DURATION } from "@tai-kun/surrealdb/encodable-datatypes";
import { Duration } from "@tai-kun/surrealdb/standard-datatypes";
import { describe, expect, test } from "vitest";

const valid = Object.entries({
  0: {
    input: 0,
    toPlainObject: {
      seconds: 0n,
      nanoseconds: 0,
    },
    total: {
      ns: 0n,
      ms: 0,
    },
    json: "0ns",
    surql: "0ns",
    string: "0ns",
    iso8601: "P0S",
  },
  "12345ns": {
    input: "12345ns",
    toPlainObject: {
      seconds: 0n,
      nanoseconds: 12_345,
    },
    total: {
      ns: 12_345n,
      ms: 0.012_345,
    },
    json: "12µs345ns",
    surql: "12µs345ns",
    string: "12µs345ns",
    iso8601: "P0S",
  },
  "012345us": {
    input: "012345us",
    toPlainObject: {
      seconds: 0n,
      nanoseconds: 12_345_000,
    },
    total: {
      ns: 12_345_000n,
      ms: 12.345_000,
    },
    json: "12ms345µs",
    surql: "12ms345µs",
    string: "12ms345µs",
    iso8601: "P0S",
  },
  "012345µs": {
    input: "012345µs",
    toPlainObject: {
      seconds: 0n,
      nanoseconds: 12_345_000,
    },
    total: {
      ns: 12_345_000n,
      ms: 12.345_000,
    },
    json: "12ms345µs",
    surql: "12ms345µs",
    string: "12ms345µs",
    iso8601: "P0S",
  },
  "012345μs": {
    input: "012345μs",
    toPlainObject: {
      seconds: 0n,
      nanoseconds: 12_345_000,
    },
    total: {
      ns: 12_345_000n,
      ms: 12.345_000,
    },
    json: "12ms345µs",
    surql: "12ms345µs",
    string: "12ms345µs",
    iso8601: "P0S",
  },
  "123456ms": {
    input: "123456ms",
    toPlainObject: {
      seconds: 123n,
      nanoseconds: 456_000_000,
    },
    total: {
      ns: 123_456_000_000n,
      ms: 123_456,
    },
    json: "2m3s456ms",
    surql: "2m3s456ms",
    string: "2m3s456ms",
    iso8601: "P2M3S",
  },
  "3601s": {
    input: "3601s",
    toPlainObject: {
      seconds: 3601n,
      nanoseconds: 0,
    },
    total: {
      ns: 3_601_000_000_000n,
      ms: 3_601_000,
    },
    json: "1h1s",
    surql: "1h1s",
    string: "1h1s",
    iso8601: "P1H1S",
  },
  "10000m": {
    input: "10000m",
    toPlainObject: {
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
    json: "6d22h40m",
    surql: "6d22h40m",
    string: "6d22h40m",
    iso8601: "P6D22H40M",
  },
  "90d": {
    input: "90d",
    toPlainObject: {
      seconds: 7_776_000n, // 90 * 24 * 60 * 60
      nanoseconds: 0,
    },
    total: {
      ns: 7_776_000_000_000_000n,
      ms: 7_776_000_000,
    },
    json: "12w6d",
    surql: "12w6d",
    string: "12w6d",
    iso8601: "P12W6D",
  },
  "100w": {
    input: "100w",
    toPlainObject: {
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
    json: "1y47w6d",
    surql: "1y47w6d",
    string: "1y47w6d",
    iso8601: "P1Y47W6D",
  },
  "2y": {
    input: "2y",
    toPlainObject: {
      seconds: 63_072_000n,
      nanoseconds: 0,
    },
    total: {
      ns: 63_072_000_000_000_000n,
      ms: 63_072_000_000,
    },
    json: "2y",
    surql: "2y",
    string: "2y",
    iso8601: "P2Y",
  },
  "1ns1us1ms1s1m": {
    input: "1ns1us1ms1s1m",
    toPlainObject: {
      seconds: 61n,
      nanoseconds: 1_001_001,
    },
    total: {
      ns: 61_001_001_001n,
      ms: 61_001.001_001,
    },
    json: "1m1s1ms1µs1ns",
    surql: "1m1s1ms1µs1ns",
    string: "1m1s1ms1µs1ns",
    iso8601: "P1M1S",
  },
  "1ms1m": {
    input: "1ms1m",
    toPlainObject: {
      seconds: 60n,
      nanoseconds: 1_000_000,
    },
    total: {
      ns: 60_001_000_000n,
      ms: 60_001,
    },
    json: "1m1ms",
    surql: "1m1ms",
    string: "1m1ms",
    iso8601: "P1M",
  },
  "1m1s1m1s1m1s": {
    input: "1m1s1m1s1m1s",
    toPlainObject: {
      seconds: 183n,
      nanoseconds: 0,
    },
    total: {
      ns: 183_000_000_000n,
      ms: 183_000,
    },
    json: "3m3s",
    surql: "3m3s",
    string: "3m3s",
    iso8601: "P3M3S",
  },
  "1234.567890": {
    input: 1234.567890,
    toPlainObject: {
      seconds: 1n,
      nanoseconds: 234_567_890,
    },
    total: {
      ns: 1_234_567_890n,
      ms: 1_234.567_890,
    },
    json: "1s234ms567µs890ns",
    surql: "1s234ms567µs890ns",
    string: "1s234ms567µs890ns",
    iso8601: "P1S",
  },
});

for (const [i, t] of valid) {
  describe(String(i), () => {
    test("プロパティー", () => {
      const d = new Duration(t.input);

      expect({ seconds: d.seconds, nanoseconds: d.nanoseconds })
        .toStrictEqual(t.toPlainObject);
    });

    test("コンパクト表現", () => {
      const d = new Duration(t.input);

      expect(d.getCompact()).toStrictEqual([
        t.toPlainObject.seconds,
        t.toPlainObject.nanoseconds,
      ]);
    });

    test("ナノ秒", () => {
      const d = new Duration(t.input);

      expect(d.valueOf()).toBe(t.total.ns);
    });

    test("ミリ秒", () => {
      const d = new Duration(t.input);

      expect(+d).toBe(t.total.ms);
    });

    test("文字列", () => {
      const d = new Duration(t.input);

      expect(`${d}`).toBe(t.string);
      expect(d.toJSON()).toBe(t.string);
      expect(d.toSurql()).toBe(t.string);
    });

    test("ISO 形式の文字列", () => {
      const d = new Duration(t.input);

      expect(d.toISOString()).toBe(t.iso8601);
    });

    test("CBOR でエンコード/デコードできる", () => {
      const input = new Duration(t.input);
      const output = new Duration(t.input);
      const bytes = encode(input);
      const dt = decode(bytes, {
        reviver: {
          tagged(t) {
            switch (t.tag) {
              case CBOR_TAG_DURATION:
                return new Duration(t.value as any);

              default:
                return undefined;
            }
          },
        },
      });

      expect(dt).toStrictEqual(output);
    });

    test(".toJSON()", () => {
      const json = new Duration(t.input).toJSON();

      expect(json).toBe(t.json);
    });

    test(".toSurql()", () => {
      const surql = new Duration(t.input).toSurql();

      expect(surql).toBe(t.surql);
    });

    test(".toPlainObject()", () => {
      const toPlainObject = new Duration(t.input).toPlainObject();

      expect(toPlainObject).toStrictEqual(t.toPlainObject);
    });
  });
}

test("有効な正の秒数で更新", () => {
  const d = new Duration(0);
  d.seconds = 100n;

  expect(d.toString()).toBe("1m40s");
});

test("無効な正の秒数で更新するとエラー", () => {
  const d = new Duration(0);

  expect(() => d.seconds = 2n ** 64n).toThrowErrorMatchingSnapshot();
});

test("負の秒数で更新するとエラー", () => {
  const d = new Duration(0);

  expect(() => d.seconds = -1n).toThrowErrorMatchingSnapshot();
});

test("有効な正のナノ秒数で更新", () => {
  const d = new Duration(0);
  d.nanoseconds = 100;

  expect(d.toString()).toBe("100ns");
});

test("NaN でナノ秒数を更新するとエラー", () => {
  const d = new Duration(0);

  expect(() => d.nanoseconds = NaN).toThrowErrorMatchingSnapshot();
});

test("Infinity でナノ秒数を更新するとエラー", () => {
  const d = new Duration(0);

  expect(() => d.nanoseconds = Infinity).toThrowErrorMatchingSnapshot();
});

test("-Infinity でナノ秒数を更新するとエラー", () => {
  const d = new Duration(0);

  expect(() => d.nanoseconds = -Infinity).toThrowErrorMatchingSnapshot();
});

test("Number.MAX_SAFE_INTEGER + 1 でナノ秒数を更新するとエラー", () => {
  const d = new Duration(0);

  expect(() => d.nanoseconds = Number.MAX_SAFE_INTEGER + 1)
    .toThrowErrorMatchingSnapshot();
});

test(".addYears()", () => {
  const d = new Duration(0);
  d.addYears(1);

  expect(d.toString()).toBe("1y");
});

test(".addWeeks()", () => {
  const d = new Duration(0);
  d.addWeeks(1);

  expect(d.toString()).toBe("1w");
});

test(".addDays()", () => {
  const d = new Duration(0);
  d.addDays(1);

  expect(d.toString()).toBe("1d");
});

test(".addHours()", () => {
  const d = new Duration(0);
  d.addHours(1);

  expect(d.toString()).toBe("1h");
});

test(".addMinutes()", () => {
  const d = new Duration(0);
  d.addMinutes(1);

  expect(d.toString()).toBe("1m");
});

test(".addSeconds()", () => {
  const d = new Duration(0);
  d.addSeconds(1);

  expect(d.toString()).toBe("1s");
});

test(".addMilliseconds()", () => {
  const d = new Duration(0);
  d.addMilliseconds(1);

  expect(d.toString()).toBe("1ms");
});

test(".addMicroseconds()", () => {
  const d = new Duration(0);
  d.addMicroseconds(1);

  expect(d.toString()).toBe("1µs");
});

test(".addNanoseconds()", () => {
  const d = new Duration(0);
  d.addNanoseconds(1);

  expect(d.toString()).toBe("1ns");
});

test(".asYears()", () => {
  const d = new Duration("1y73d");

  expect(d.asYears()).toBe(1.2);
});

test(".asWeeks()", () => {
  const d = new Duration("14d");

  expect(d.asWeeks()).toBe(2);
});

test(".asDays()", () => {
  const d = new Duration("1w");

  expect(d.asDays()).toBe(7);
});

test(".asHours()", () => {
  const d = new Duration("1w3d");

  expect(d.asHours()).toBe(240);
});

test(".asMinutes()", () => {
  const d = new Duration("2m59s1000ms");

  expect(d.asMinutes()).toBe(3);
});

test(".asSeconds()", () => {
  const d = new Duration("500ns");

  expect(d.asSeconds()).toBe(0.000_000_5);
});

test(".asMilliseconds()", () => {
  const d = new Duration("0s");

  expect(d.asMilliseconds()).toBe(0);
});

test(".asMicroseconds()", () => {
  const d = new Duration("1ms100ns");

  expect(d.asMicroseconds()).toBe(1_000.1);
});

test(".asNanoseconds()", () => {
  const d = new Duration("999999999ns");

  expect(d.asNanoseconds()).toBe(999_999_999);
});

describe("Duration.MAX", () => {
  test("毎度異なるインスタンス", () => {
    expect(Duration.MAX).not.toBe(Duration.MAX);
  });

  test("継承先のクラスを使ってインスタンスを作成する", () => {
    class MyDuration extends Duration {}

    expect(MyDuration.MAX).toBeInstanceOf(MyDuration);
  });

  test("秒数は uint64 の最大値", () => {
    expect(Duration.MAX.seconds).toBe(2n ** 64n - 1n);
  });

  test("ナノ秒数は 999,999,999", () => {
    expect(Duration.MAX.nanoseconds).toBe(999_999_999);
  });

  test("年月日等をそれぞれ取得できる", () => {
    expect(Duration.MAX.getYears()).toBe(584942417355);
    expect(Duration.MAX.getWeeks()).toBe(3);
    expect(Duration.MAX.getDays()).toBe(5);
    expect(Duration.MAX.getHours()).toBe(7);
    expect(Duration.MAX.getMinutes()).toBe(0);
    expect(Duration.MAX.getSeconds()).toBe(15);
    expect(Duration.MAX.getMilliseconds()).toBe(999);
    expect(Duration.MAX.getMicroseconds()).toBe(999);
    expect(Duration.MAX.getNanoseconds()).toBe(999);
  });
});

describe("Duration.ZERO", () => {
  test("毎度異なるインスタンス", () => {
    expect(Duration.ZERO).not.toBe(Duration.ZERO);
  });

  test("継承先のクラスを使ってインスタンスを作成する", () => {
    class MyDuration extends Duration {}

    expect(MyDuration.ZERO).toBeInstanceOf(MyDuration);
  });

  test("秒数は 0n", () => {
    expect(Duration.ZERO.seconds).toBe(0n);
  });

  test("ナノ秒数は 0", () => {
    expect(Duration.ZERO.nanoseconds).toBe(0);
  });

  test("年月日等をそれぞれ取得できる", () => {
    expect(Duration.ZERO.getYears()).toBe(0);
    expect(Duration.ZERO.getWeeks()).toBe(0);
    expect(Duration.ZERO.getDays()).toBe(0);
    expect(Duration.ZERO.getHours()).toBe(0);
    expect(Duration.ZERO.getMinutes()).toBe(0);
    expect(Duration.ZERO.getSeconds()).toBe(0);
    expect(Duration.ZERO.getMilliseconds()).toBe(0);
    expect(Duration.ZERO.getMicroseconds()).toBe(0);
    expect(Duration.ZERO.getNanoseconds()).toBe(0);
  });
});

test(".years()", () => {
  expect(Duration.years(1).toString()).toBe("1y");
});

test(".weeks()", () => {
  expect(Duration.weeks(1).toString()).toBe("1w");
});

test(".days()", () => {
  expect(Duration.days(1).toString()).toBe("1d");
});

test(".hours()", () => {
  expect(Duration.hours(1).toString()).toBe("1h");
});

test(".minutes()", () => {
  expect(Duration.minutes(1).toString()).toBe("1m");
});

test(".seconds()", () => {
  expect(Duration.seconds(1).toString()).toBe("1s");
});

test(".milliseconds()", () => {
  expect(Duration.milliseconds(1).toString()).toBe("1ms");
});

test(".microseconds()", () => {
  expect(Duration.microseconds(1).toString()).toBe("1µs");
});

test(".nanoseconds()", () => {
  expect(Duration.nanoseconds(1).toString()).toBe("1ns");
});

// test("年月日等で表現されたミリ秒を取得できる", () => {
//   const d = new Duration(365 * 24 * 60 * 60 * 1_000 + 0.123456);
//   // TODO(tai-kun): expect().toBeCloseTo() でテストして良いか？
// });

test(".clone() で複製できる", () => {
  class MyDuration extends Duration {}

  const d1 = new MyDuration([123, 456]);
  const d2 = d1.clone();

  expect(d2).toBeInstanceOf(MyDuration);
  expect(d1).not.toBe(d2);
  expect(d1.getCompact()).toStrictEqual(d2.getCompact());
});

test("Duration であると判定できる", () => {
  expect(isDuration(new Duration(0))).toBe(true);
  expect(isDuration(0)).toBe(false);
});
