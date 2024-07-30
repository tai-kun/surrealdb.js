import { decode, encode } from "@tai-kun/surreal/cbor";
import {
  Datetime as EncodableDatetime,
  TAG_CUSTOM_DATETIME,
} from "@tai-kun/surreal/data-types/encodable";
import { Datetime } from "@tai-kun/surreal/data-types/standard";
import { describe, expect, test } from "vitest";

type Suite = {
  args: any[];
  seconds: number;
  nanoseconds: number;
  nanoTime: bigint;
  iso: string;
  skip?: boolean;
} | {
  args: any[];
  seconds: number;
  nanoseconds: number;
  nanoTime?: never;
  iso?: never;
  skip?: boolean;
};

const suites: Record<string, Suite> = {
  "(仕様確認) WebKit ではミリ秒未満の精度が丸められる": {
    args: ["1969-12-31T23:59:59.9991Z"],
    seconds: 0,
    nanoseconds: 0,
    nanoTime: 0n,
    iso: "1970-01-01T00:00:00.000000000Z",
    skip: process.env.RUNTIME !== "webkit",
  },
  "(仕様確認) WebKit 以外ではミリ秒未満の精度が丸められずに切り捨てられる": {
    args: ["1969-12-31T23:59:59.9991Z"],
    seconds: -1,
    nanoseconds: 999000000,
    nanoTime: -1000000n,
    iso: "1969-12-31T23:59:59.999000000Z",
    skip: process.env.RUNTIME === "webkit",
  },
  "有効な文字列": {
    args: ["2024-06-01T12:34:56.780123456789Z"],
    seconds: 1717245296,
    nanoseconds: 780_000_000, // ミリ秒未満の精度は消える
    nanoTime: 1717245296_780000000n,
    iso: "2024-06-01T12:34:56.780000000Z",
  },
  "UNIX エポック以前の文字列 (WebKit のみ)": {
    args: ["1960-06-01T12:34:56.780123456789Z"],
    seconds: -302441103 - 1,
    nanoseconds: 781_000_000, // ミリ秒未満の精度は消える
    nanoTime: -302441103_219000000n,
    iso: "1960-06-01T12:34:56.781000000Z",
    skip: process.env.RUNTIME !== "webkit",
  },
  "UNIX エポック以前の文字列 (WebKit 以外)": {
    args: ["1960-06-01T12:34:56.780123456789Z"],
    seconds: -302441103 - 1,
    nanoseconds: 780_000_000, // ミリ秒未満の精度は消える
    nanoTime: -302441103_220000000n,
    iso: "1960-06-01T12:34:56.780000000Z",
    skip: process.env.RUNTIME === "webkit",
  },
  "無効な文字列": {
    args: ["2024年の6月ついたち、正午すぎ"],
    seconds: NaN,
    nanoseconds: NaN,
  },
  "有効な配列": {
    args: [[1717245296, 780123456]],
    seconds: 1717245296,
    nanoseconds: 780123456,
    nanoTime: 1717245296_780123456n,
    iso: "2024-06-01T12:34:56.780123456Z",
  },
  "ナノ秒が 999_999_999 を超える配列": {
    args: [[0, 61_780123456]],
    seconds: 61,
    nanoseconds: 780123456,
    nanoTime: 61_780123456n,
    iso: "1970-01-01T00:01:01.780123456Z",
  },
};

// -----------------------------------------------------------------------------
//
// Decode-only / Encodable Datetime
//
// -----------------------------------------------------------------------------

describe("decode-only/encodable", () => {
  for (const [t, c] of Object.entries(suites)) {
    describe.skipIf(!!c.skip)(t, () => {
      test("秒とナノ秒を取得する", () => {
        const dt = new EncodableDatetime(...c.args as [any]);

        expect(dt.seconds).toBe(c.seconds);
        expect(dt.nanoseconds).toBe(c.nanoseconds);
      });

      test("ミリ秒時刻を取得する", { skip: !("nanoTime" in c) }, () => {
        const msTime = Number(c.nanoTime! / 1_000_000n);
        const dt = new EncodableDatetime(...c.args as [any]);

        expect(dt.valueOf()).toBe(msTime);
        expect(+dt).toBe(msTime);
      });

      test("ISO 形式の文字列にする", { skip: !("iso" in c) }, () => {
        const dt = new EncodableDatetime(...c.args as [any]);

        expect(dt.toISOString()).toBe(c.iso);
      });

      test(
        "ISO 形式の文字列にしようとすると失敗する",
        { skip: "iso" in c },
        () => {
          const dt = new EncodableDatetime(...c.args as [any]);

          expect(() => dt.toISOString()).toThrow();
        },
      );

      test("CBOR でエンコード/デコードできる", () => {
        const input = new EncodableDatetime(...c.args as [any]);
        const output = new EncodableDatetime(...c.args as [any]);
        const bytes = encode(input);
        const dt = decode(bytes, {
          reviver: {
            tagged(t) {
              switch (t.tag) {
                case TAG_CUSTOM_DATETIME:
                  return new EncodableDatetime(t.value as any);

                default:
                  return undefined;
              }
            },
          },
        });

        expect(dt).toStrictEqual(output);
      });
    });
  }
});

// -----------------------------------------------------------------------------
//
// Datetime
//
// -----------------------------------------------------------------------------

describe("standard", () => {
  // Add test suites
  Object.assign<any, Record<string, Suite>>(suites, {
    "負のナノ秒を持つ配列": {
      args: [[61, -61_000000000]],
      seconds: 0,
      nanoseconds: 0,
      nanoTime: 0n,
      iso: "1970-01-01T00:00:00.000000000Z",
    },
    "有効な正のミリ秒時刻": {
      args: [1717245296_780],
      seconds: 1717245296,
      nanoseconds: 780_000_000,
      nanoTime: 1717245296_780000000n,
      iso: "2024-06-01T12:34:56.780000000Z",
    },
    "有効な負のミリ秒時刻": {
      args: [-302441103_220],
      seconds: -302441103 - 1,
      nanoseconds: 780_000_000,
      nanoTime: -302441103_220000000n,
      iso: "1960-06-01T12:34:56.780000000Z",
    },
    "無効なミリ秒時刻": {
      args: [NaN],
      seconds: NaN,
      nanoseconds: NaN,
    },
    "有効な正のナノ秒時刻": {
      args: [1717245296_780123456n],
      seconds: 1717245296,
      nanoseconds: 780123456,
      nanoTime: 1717245296_780123456n,
      iso: "2024-06-01T12:34:56.780123456Z",
    },
    "有効な負のナノ秒時刻": {
      args: [-302441103_220000100n],
      seconds: -302441103 - 1,
      nanoseconds: 779_999_900,
      nanoTime: -302441103_220000100n,
      iso: "1960-06-01T12:34:56.779999900Z",
    },
    "Date 上限値の正のナノ秒数": {
      args: [8640000000000_000000000n],
      seconds: 8640000000000,
      nanoseconds: 0,
      nanoTime: 8640000000000_000000000n,
      iso: "+275760-09-13T00:00:00.000000000Z",
    },
    "Date 下限値の正のナノ秒数": {
      args: [-8640000000000_000000000n],
      seconds: -8640000000000,
      nanoseconds: 0,
      nanoTime: -8640000000000_000000000n,
      iso: "-271821-04-20T00:00:00.000000000Z",
    },
    "Date 範囲外の正のナノ秒数": {
      args: [8640000000000_000000001n],
      seconds: NaN,
      nanoseconds: NaN,
    },
    "Date 範囲外の負のナノ秒数": {
      args: [-8640000000000_000000001n],
      seconds: NaN,
      nanoseconds: NaN,
    },
    "有効な Date オブジェクト": {
      args: [new Date(0)],
      seconds: 0,
      nanoseconds: 0,
      nanoTime: 0n,
      iso: "1970-01-01T00:00:00.000000000Z",
    },
    "無効な Date オブジェクト": {
      args: [new Date(NaN)],
      seconds: NaN,
      nanoseconds: NaN,
    },
    "Datetime のようなオブジェクト": {
      args: [{
        seconds: 1717245296,
        nanoseconds: 780123456,
      }],
      seconds: 1717245296,
      nanoseconds: 780123456,
      nanoTime: 1717245296_780123456n,
      iso: "2024-06-01T12:34:56.780123456Z",
    },
    "有効な年月日等": {
      args: [2024, 6 - 1, 1, 12, 34, 56, 780, 123, 456],
      seconds: 1717245296,
      nanoseconds: 780123456,
      nanoTime: 1717245296_780123456n,
      iso: "2024-06-01T12:34:56.780123456Z",
    },
    "マイクロ秒が 999 を超える年月日等": {
      args: [2024, 6 - 1, 1, 12, 34, 56, 780, 321_123, 456],
      seconds: 1717245297,
      nanoseconds: 101123456,
      nanoTime: 1717245297_101123456n,
      iso: "2024-06-01T12:34:57.101123456Z",
    },
    "西暦 1 万年以降には `+` プレフィクスが付く": {
      args: [10_000, 6 - 1, 1, 12, 34, 56, 780, 123, 456],
      seconds: 253415478896,
      nanoseconds: 780123456,
      nanoTime: 253415478896_780123456n,
      iso: "+010000-06-01T12:34:56.780123456Z",
    },
    "西暦 0 年": {
      args: [-62167219200000],
      seconds: -62167219200,
      nanoseconds: 0,
      nanoTime: -62167219200_000000000n,
      iso: "0000-01-01T00:00:00.000000000Z",
    },
    "紀元前には `-` プレフィクスが付く": {
      args: [-62167219200001],
      seconds: -62167219200 - 1,
      nanoseconds: 999000000,
      nanoTime: -62167219200_001000000n,
      iso: "-000001-12-31T23:59:59.999000000Z",
    },
  });

  test("現在時刻で Datetime インスタンスを作成する", () => {
    const dt = new Datetime();

    expect(dt).toBeInstanceOf(Datetime);
    expect(dt.seconds).toBeTypeOf("number");
    expect(dt.nanoseconds).toBeTypeOf("number");
    expect(+dt).toBeTypeOf("number");
  });

  for (const [t, c] of Object.entries(suites)) {
    describe.skipIf(!!c.skip)(t, () => {
      test("秒とナノ秒を取得する", () => {
        const dt = new Datetime(...c.args);

        expect(dt.seconds).toBe(c.seconds);
        expect(dt.nanoseconds).toBe(c.nanoseconds);
      });

      test("ミリ秒時刻を取得する", { skip: !("nanoTime" in c) }, () => {
        const msTime = Number(c.nanoTime! / 1_000_000n);
        const dt = new Datetime(...c.args);

        expect(dt.getTime()).toBe(msTime);
        expect(dt.valueOf()).toBe(msTime);
        expect(+dt).toBe(msTime);
      });

      test("ナノ秒時刻が一致する", { skip: !("nanoTime" in c) }, () => {
        const dt = new Datetime(...c.args);

        expect(BigInt(dt.seconds) * 1_000_000_000n + BigInt(dt.nanoseconds))
          .toBe(c.nanoTime);
      });

      test("ISO 形式の文字列にする", { skip: !("iso" in c) }, () => {
        const dt = new Datetime(...c.args);

        expect(dt.toISOString()).toBe(c.iso);
      });

      test(
        "ISO 形式の文字列にしようとすると失敗する",
        { skip: "iso" in c },
        () => {
          const dt = new Datetime(...c.args);

          expect(() => dt.toISOString()).toThrow();
        },
      );

      test("CBOR でエンコード/デコードできる", () => {
        const input = new Datetime(...c.args);
        const output = new Datetime(...c.args);
        const bytes = encode(input);
        const dt = decode(bytes, {
          reviver: {
            tagged(t) {
              switch (t.tag) {
                case TAG_CUSTOM_DATETIME:
                  return new Datetime(t.value as any);

                default:
                  return undefined;
              }
            },
          },
        });

        expect(dt).toStrictEqual(output);
      });
    });
  }

  test("秒時刻を有効な秒時刻で上書きする", () => {
    const dt = new Datetime([1717245296, 780123456]);
    dt.seconds = 61.9; // 小数点以下切り捨て

    expect(dt.seconds).toBe(61);
    expect(dt.nanoseconds).toBe(780123456);
    expect(dt.toISOString()).toBe("1970-01-01T00:01:01.780123456Z");
  });

  test("秒時刻を無効な秒時刻で上書きする", () => {
    const dt = new Datetime([1717245296, 780123456]);
    dt.seconds = NaN;

    expect(dt.seconds).toBe(NaN);
    expect(dt.nanoseconds).toBe(NaN);
    expect(() => dt.toISOString()).toThrow();
  });

  test("秒時刻を負の秒時刻で上書きする", () => {
    const dt = new Datetime([1717245296, 780123456]);
    dt.seconds = -1.9; // 小数点以下切り捨て

    expect(dt.seconds).toBe(-1);
    expect(dt.nanoseconds).toBe(780123456);
    expect(dt.toISOString()).toBe("1969-12-31T23:59:59.780123456Z");
  });

  test("ナノ秒時刻を有効なナノ秒時刻で上書きする", () => {
    const dt = new Datetime([1717245296, 780123456]);
    dt.nanoseconds = 123456;

    expect(dt.seconds).toBe(1717245296);
    expect(dt.nanoseconds).toBe(123456);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.000123456Z");
  });

  test("ナノ秒時刻を無効なナノ秒時刻で上書きする", () => {
    const dt = new Datetime([1717245296, 780123456]);
    dt.nanoseconds = NaN;

    expect(dt.seconds).toBe(NaN);
    expect(dt.nanoseconds).toBe(NaN);
    expect(() => dt.toISOString()).toThrow();
  });

  test("ナノ秒時刻を負のナノ秒時刻で上書きする", () => {
    const dt = new Datetime([1717245296, 780123456]);
    dt.nanoseconds = -1.9; // 小数点以下切り捨て

    expect(dt.seconds).toBe(1717245295);
    expect(dt.nanoseconds).toBe(999999999);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:55.999999999Z");
  });

  test("コンパクト表現を取得できる", () => {
    const dt = new Datetime([1717245296, 780123456]);

    expect(dt.getCompact()).toStrictEqual([1717245296, 780123456]);
  });

  test("コンパクト表現で日付を再設定できる", () => {
    const dt = new Datetime(0);
    const time = dt.setCompact([1717245296, 780123456]);

    expect(time).toBe(1717245296_780);
    expect(dt.getCompact()).toStrictEqual([1717245296, 780123456]);
  });

  test("ミリ秒を取得できる", () => {
    const dt = new Datetime([1717245296, 780123456]);

    expect(dt.getMilliseconds()).toBe(780);
    expect(dt.getUTCMilliseconds()).toBe(780);
  });

  test("小さな正のミリ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCMilliseconds(123);

    expect(time).toBe(1717245296_123);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.123123456Z");
  });

  test("小さな負のミリ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCMilliseconds(-1);

    expect(time).toBe(1717245295_999);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:55.999123456Z");
  });

  test("大きな正のミリ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCMilliseconds(1_000);

    expect(time).toBe(1717245297_000);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:57.000123456Z");
  });

  test("大きな負のミリ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCMilliseconds(-1_000);

    expect(time).toBe(1717245295_000);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:55.000123456Z");
  });

  test("マイクロ秒を取得できる", () => {
    const dt = new Datetime([1717245296, 780123456]);

    expect(dt.getMicroseconds()).toBe(123);
    expect(dt.getUTCMicroseconds()).toBe(123);
  });

  test("小さな正のマイクロ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCMicroseconds(780);

    expect(time).toBe(1717245296_780);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.780780456Z");
  });

  test("小さな負のマイクロ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCMicroseconds(-1);

    expect(time).toBe(1717245296_779);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.779999456Z");
  });

  test("大きな正のマイクロ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCMicroseconds(1_000);

    expect(time).toBe(1717245296_781);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.781000456Z");
  });

  test("大きな負のマイクロ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCMicroseconds(-1_000);

    expect(time).toBe(1717245296_779);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.779000456Z");
  });

  test("ナノ秒を取得できる", () => {
    const dt = new Datetime([1717245296, 780123456]);

    expect(dt.getNanoseconds()).toBe(456);
    expect(dt.getUTCNanoseconds()).toBe(456);
  });

  test("小さな正のナノ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCNanoseconds(780);

    expect(time).toBe(1717245296_780);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.780123780Z");
  });

  test("小さな負のナノ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCNanoseconds(-1);

    expect(time).toBe(1717245296_780);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.780122999Z");
  });

  test("大きな正のナノ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCNanoseconds(1_000);

    expect(time).toBe(1717245296_780);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.780124000Z");
  });

  test("大きな負のナノ秒を設定できる", () => {
    const dt = new Datetime([1717245296, 780123456]);
    const time = dt.setUTCNanoseconds(-1_000);

    expect(time).toBe(1717245296_780);
    expect(dt.toISOString()).toBe("2024-06-01T12:34:56.780122000Z");
  });
});
