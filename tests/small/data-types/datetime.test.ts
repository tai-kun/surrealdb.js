import { isDatetime } from "@tai-kun/surrealdb";
import { decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_CUSTOM_DATETIME,
  Datetime as EncodableDatetime,
} from "@tai-kun/surrealdb/data-types/encodable";
import { Datetime } from "@tai-kun/surrealdb/data-types/standard";
import { describe, expect, test } from "vitest";

type Suite =
  // 有効
  | {
    args: any[];
    seconds: number;
    nanoseconds: number;
    time: number;
    iso: string;
    json: string;
    surql: string;
    string: string;
    skip?: boolean;
  }
  // 無効
  | {
    args: any[];
    seconds: number;
    nanoseconds: number;
    time?: never;
    iso?: never;
    json?: never;
    surql?: never;
    string?: never;
    skip?: boolean;
  };

type Suites = Record<string, Suite>;

// -----------------------------------------------------------------------------
//
// Decode-only / Encodable Datetime
//
// -----------------------------------------------------------------------------

const decEncSuites: Suites = {
  "(仕様確認) WebKit ではミリ秒未満の精度が丸められる": {
    args: ["1969-12-31T23:59:59.9991Z"],
    seconds: 0,
    nanoseconds: 0,
    time: 0,
    iso: "1970-01-01T00:00:00.000Z",
    json: "1970-01-01T00:00:00.000Z",
    surql: "d'1970-01-01T00:00:00.000Z'",
    string: new Date("1970-01-01T00:00:00.000Z").toString(),
    skip: process.env.RUNTIME !== "webkit",
  },
  "(仕様確認) WebKit 以外ではミリ秒未満の精度が丸められずに切り捨てられる": {
    args: ["1969-12-31T23:59:59.9991Z"],
    seconds: -1,
    nanoseconds: 999000000,
    time: -1,
    iso: "1969-12-31T23:59:59.999000000Z",
    json: "1969-12-31T23:59:59.999000000Z",
    surql: "d'1969-12-31T23:59:59.999000000Z'",
    string: new Date("1969-12-31T23:59:59.999Z").toString(),
    skip: process.env.RUNTIME === "webkit",
  },
  "有効な文字列": {
    args: ["2024-06-01T12:34:56.780123456789Z"],
    seconds: 1717245296,
    nanoseconds: 780_000_000, // ミリ秒未満の精度は消える
    time: 1717245296_780,
    iso: "2024-06-01T12:34:56.780000000Z",
    json: "2024-06-01T12:34:56.780000000Z",
    surql: "d'2024-06-01T12:34:56.780000000Z'",
    string: new Date("2024-06-01T12:34:56.780Z").toString(),
  },
  "UNIX エポック以前の文字列 (WebKit のみ)": {
    args: ["1960-06-01T12:34:56.780123456789Z"],
    seconds: -302441103 - 1,
    nanoseconds: 781_000_000, // ミリ秒未満の精度は消える
    time: -302441103_219,
    iso: "1960-06-01T12:34:56.781000000Z",
    json: "1960-06-01T12:34:56.781000000Z",
    surql: "d'1960-06-01T12:34:56.781000000Z'",
    string: new Date("1960-06-01T12:34:56.781Z").toString(),
    skip: process.env.RUNTIME !== "webkit",
  },
  "UNIX エポック以前の文字列 (WebKit 以外)": {
    args: ["1960-06-01T12:34:56.780123456789Z"],
    seconds: -302441103 - 1,
    nanoseconds: 780_000_000, // ミリ秒未満の精度は消える
    time: -302441103_220,
    iso: "1960-06-01T12:34:56.780000000Z",
    json: "1960-06-01T12:34:56.780000000Z",
    surql: "d'1960-06-01T12:34:56.780000000Z'",
    string: new Date("1960-06-01T12:34:56.780000000Z").toString(),
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
    time: 1717245296_780,
    iso: "2024-06-01T12:34:56.780123456Z",
    json: "2024-06-01T12:34:56.780123456Z",
    surql: "d'2024-06-01T12:34:56.780123456Z'",
    string: new Date("2024-06-01T12:34:56.780123456Z").toString(),
  },
  "ナノ秒が 999_999_999 を超える配列": {
    args: [[0, 61_780123456]],
    seconds: 61,
    nanoseconds: 780123456,
    time: 61_780,
    iso: "1970-01-01T00:01:01.780123456Z",
    json: "1970-01-01T00:01:01.780123456Z",
    surql: "d'1970-01-01T00:01:01.780123456Z'",
    string: new Date("1970-01-01T00:01:01.780123456Z").toString(),
  },
};

describe("decode-only/encodable", () => {
  for (const [t, c] of Object.entries(decEncSuites)) {
    describe.skipIf(!!c.skip)(t, () => {
      test("秒とナノ秒を取得する", () => {
        const dt = new EncodableDatetime(...c.args as [any]);

        expect(dt.seconds).toBe(c.seconds);
        expect(dt.nanoseconds).toBe(c.nanoseconds);
      });

      test("ミリ秒時刻を取得する", { skip: !("time" in c) }, () => {
        const dt = new EncodableDatetime(...c.args as [any]);

        expect(dt.valueOf()).toBe(c.time);
        expect(+dt).toBe(c.time);
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

          expect(() => dt.toISOString()).toThrowError();
        },
      );

      test(".toString()", { skip: !("string" in c) }, () => {
        expect((new EncodableDatetime(...c.args as [any])).toString())
          .toBe(c.string);
      });

      test("テンプレートリテラル", { skip: !("string" in c) }, () => {
        expect(`${new EncodableDatetime(...c.args as [any])}`).toBe(c.string);
      });

      test("文字列へ暗黙の型変換", { skip: !("string" in c) }, () => {
        expect("" + new EncodableDatetime(...c.args as [any])).toBe(c.string);
      });

      test("数値へ暗黙の型変換", { skip: !("time" in c) }, () => {
        expect(+new EncodableDatetime(...c.args as [any])).toBe(c.time);
      });

      test("CBOR でエンコード/デコードできる", () => {
        const input = new EncodableDatetime(...c.args as [any]);
        const output = new EncodableDatetime(...c.args as [any]);
        const bytes = encode(input);
        const dt = decode(bytes, {
          reviver: {
            tagged(t) {
              switch (t.tag) {
                case CBOR_TAG_CUSTOM_DATETIME:
                  return new EncodableDatetime(t.value as any);

                default:
                  return undefined;
              }
            },
          },
        });

        expect(dt).toStrictEqual(output);
      });

      test(".toJSON()", { skip: !("json" in c) }, () => {
        const json = new EncodableDatetime(...c.args as [any]).toJSON();

        expect(json).toBe(c.json);
      });

      test(".toSurql()", { skip: !("surql" in c) }, () => {
        const surql = new EncodableDatetime(...c.args as [any]).toSurql();

        expect(surql).toBe(c.surql);
      });

      test(".structure()", () => {
        const structure = new EncodableDatetime(...c.args as [any]).structure();

        expect(structure).toStrictEqual({
          seconds: c.seconds,
          nanoseconds: c.nanoseconds,
        });
      });
    });
  }

  test("-0 を 0 にする", () => {
    const dt = new EncodableDatetime([-0, -0]);

    expect(dt.structure()).toStrictEqual({
      seconds: 0,
      nanoseconds: 0,
    });
  });
});

// -----------------------------------------------------------------------------
//
// Standard Datetime
//
// -----------------------------------------------------------------------------

const standardSuites: Suites = {
  ...decEncSuites,
  "負のナノ秒を持つ配列": {
    args: [[61, -61_000000000]],
    seconds: 0,
    nanoseconds: 0,
    time: 0,
    iso: "1970-01-01T00:00:00.000000000Z",
    json: "1970-01-01T00:00:00.000000000Z",
    surql: "d'1970-01-01T00:00:00.000000000Z'",
    string: new Date("1970-01-01T00:00:00.000000000Z").toString(),
  },
  "有効な正のミリ秒時刻": {
    args: [1717245296_780],
    seconds: 1717245296,
    nanoseconds: 780_000_000,
    time: 1717245296_780,
    iso: "2024-06-01T12:34:56.780000000Z",
    json: "2024-06-01T12:34:56.780000000Z",
    surql: "d'2024-06-01T12:34:56.780000000Z'",
    string: new Date("2024-06-01T12:34:56.780000000Z").toString(),
  },
  "有効な負のミリ秒時刻": {
    args: [-302441103_220],
    seconds: -302441103 - 1,
    nanoseconds: 780_000_000,
    time: -302441103_220,
    iso: "1960-06-01T12:34:56.780000000Z",
    json: "1960-06-01T12:34:56.780000000Z",
    surql: "d'1960-06-01T12:34:56.780000000Z'",
    string: new Date("1960-06-01T12:34:56.780000000Z").toString(),
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
    time: 1717245296_780,
    iso: "2024-06-01T12:34:56.780123456Z",
    json: "2024-06-01T12:34:56.780123456Z",
    surql: "d'2024-06-01T12:34:56.780123456Z'",
    string: new Date("2024-06-01T12:34:56.780123456Z").toString(),
  },
  "有効な負のナノ秒時刻": {
    args: [-302441103_220000100n],
    seconds: -302441103 - 1,
    nanoseconds: 779_999_900,
    time: -302441103_220,
    iso: "1960-06-01T12:34:56.779999900Z",
    json: "1960-06-01T12:34:56.779999900Z",
    surql: "d'1960-06-01T12:34:56.779999900Z'",
    string: new Date("1960-06-01T12:34:56.779999900Z").toString(),
  },
  "Date 上限値の正のナノ秒数": {
    args: [8640000000000_000000000n],
    seconds: 8640000000000,
    nanoseconds: 0,
    time: 8640000000000_000,
    iso: "+275760-09-13T00:00:00.000000000Z",
    json: "+275760-09-13T00:00:00.000000000Z",
    surql: "d'+275760-09-13T00:00:00.000000000Z'",
    string: new Date("+275760-09-13T00:00:00.000000000Z").toString(),
  },
  "Date 下限値の正のナノ秒数": {
    args: [-8640000000000_000000000n],
    seconds: -8640000000000,
    nanoseconds: 0,
    time: -8640000000000_000,
    iso: "-271821-04-20T00:00:00.000000000Z",
    json: "-271821-04-20T00:00:00.000000000Z",
    surql: "d'-271821-04-20T00:00:00.000000000Z'",
    string: new Date("-271821-04-20T00:00:00.000000000Z").toString(),
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
    time: 0,
    iso: "1970-01-01T00:00:00.000000000Z",
    json: "1970-01-01T00:00:00.000000000Z",
    surql: "d'1970-01-01T00:00:00.000000000Z'",
    string: new Date("1970-01-01T00:00:00.000000000Z").toString(),
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
    time: 1717245296_780,
    iso: "2024-06-01T12:34:56.780123456Z",
    json: "2024-06-01T12:34:56.780123456Z",
    surql: "d'2024-06-01T12:34:56.780123456Z'",
    string: new Date("2024-06-01T12:34:56.780123456Z").toString(),
  },
  "有効な年月日等": {
    args: [2024, 6 - 1, 1, 12, 34, 56, 780, 123, 456],
    seconds: 1717245296,
    nanoseconds: 780123456,
    time: 1717245296_780,
    iso: "2024-06-01T12:34:56.780123456Z",
    json: "2024-06-01T12:34:56.780123456Z",
    surql: "d'2024-06-01T12:34:56.780123456Z'",
    string: new Date("2024-06-01T12:34:56.780123456Z").toString(),
  },
  "マイクロ秒が 999 を超える年月日等": {
    args: [2024, 6 - 1, 1, 12, 34, 56, 780, 321_123, 456],
    seconds: 1717245297,
    nanoseconds: 101123456,
    time: 1717245297_101,
    iso: "2024-06-01T12:34:57.101123456Z",
    json: "2024-06-01T12:34:57.101123456Z",
    surql: "d'2024-06-01T12:34:57.101123456Z'",
    string: new Date("2024-06-01T12:34:57.101123456Z").toString(),
  },
  "西暦 1 万年以降には `+` プレフィクスが付く": {
    args: [10_000, 6 - 1, 1, 12, 34, 56, 780, 123, 456],
    seconds: 253415478896,
    nanoseconds: 780123456,
    time: 253415478896_780,
    iso: "+010000-06-01T12:34:56.780123456Z",
    json: "+010000-06-01T12:34:56.780123456Z",
    surql: "d'+010000-06-01T12:34:56.780123456Z'",
    string: new Date("+010000-06-01T12:34:56.780123456Z").toString(),
  },
  "西暦 0 年": {
    args: [-62167219200000],
    seconds: -62167219200,
    nanoseconds: 0,
    time: -62167219200_000,
    iso: "0000-01-01T00:00:00.000000000Z",
    json: "0000-01-01T00:00:00.000000000Z",
    surql: "d'0000-01-01T00:00:00.000000000Z'",
    string: new Date("0000-01-01T00:00:00.000000000Z").toString(),
  },
  "紀元前には `-` プレフィクスが付く": {
    args: [-62167219200001],
    seconds: -62167219200 - 1,
    nanoseconds: 999000000,
    time: -62167219200_001,
    iso: "-000001-12-31T23:59:59.999000000Z",
    json: "-000001-12-31T23:59:59.999000000Z",
    surql: "d'-000001-12-31T23:59:59.999000000Z'",
    string: new Date("-000001-12-31T23:59:59.999000000Z").toString(),
  },
};

describe("standard", () => {
  test("現在時刻で Datetime インスタンスを作成する", () => {
    const dt = new Datetime();

    expect(dt).toBeInstanceOf(Datetime);
    expect(dt.seconds).toBeTypeOf("number");
    expect(dt.nanoseconds).toBeTypeOf("number");
    expect(+dt).toBeTypeOf("number");
  });

  for (const [t, c] of Object.entries(standardSuites)) {
    describe.skipIf(!!c.skip)(t, () => {
      test("秒とナノ秒を取得する", () => {
        const dt = new Datetime(...c.args);

        expect(dt.seconds).toBe(c.seconds);
        expect(dt.nanoseconds).toBe(c.nanoseconds);
      });

      test("ミリ秒時刻を取得する", { skip: !("time" in c) }, () => {
        const dt = new Datetime(...c.args);

        expect(dt.getTime()).toBe(c.time);
        expect(dt.valueOf()).toBe(c.time);
        expect(+dt).toBe(c.time);
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

          expect(() => dt.toISOString()).toThrowError();
        },
      );

      test(".toString()", { skip: !("string" in c) }, () => {
        expect((new Datetime(...c.args as [any])).toString())
          .toBe(c.string);
      });

      test("テンプレートリテラル", { skip: !("string" in c) }, () => {
        expect(`${new Datetime(...c.args as [any])}`).toBe(c.string);
      });

      test("文字列へ暗黙の型変換", { skip: !("string" in c) }, () => {
        expect("" + new Datetime(...c.args as [any])).toBe(c.string);
      });

      // test("数値へ暗黙の型変換", { skip: !("time" in c) }, () => {
      //   expect(+new Datetime(...c.args as [any])).toBe(c.time);
      // });

      test("CBOR でエンコード/デコードできる", () => {
        const input = new Datetime(...c.args);
        const output = new Datetime(...c.args);
        const bytes = encode(input);
        const dt = decode(bytes, {
          reviver: {
            tagged(t) {
              switch (t.tag) {
                case CBOR_TAG_CUSTOM_DATETIME:
                  return new Datetime(t.value as any);

                default:
                  return undefined;
              }
            },
          },
        });

        expect(dt).toStrictEqual(output);
      });

      test(".toJSON()", { skip: !("json" in c) }, () => {
        const json = new Datetime(...c.args as [any]).toJSON();

        expect(json).toBe(c.json);
      });

      test(".toSurql()", { skip: !("surql" in c) }, () => {
        const surql = new Datetime(...c.args as [any]).toSurql();

        expect(surql).toBe(c.surql);
      });

      test(".structure()", () => {
        const structure = new Datetime(...c.args as [any]).structure();

        expect(structure).toStrictEqual({
          seconds: c.seconds,
          nanoseconds: c.nanoseconds,
        });
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
    expect(() => dt.toISOString()).toThrowError();
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
    expect(() => dt.toISOString()).toThrowError();
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

  test("-0 を 0 にする", () => {
    const dt = new Datetime([-0, -0]);

    expect(dt.structure()).toStrictEqual({
      seconds: 0,
      nanoseconds: 0,
    });
  });
});

test("Datetime であると判定できる", () => {
  expect(isDatetime(new EncodableDatetime([0, 0]))).toBe(true);
  expect(isDatetime(new Datetime())).toBe(true);
  expect(isDatetime([0, 0])).toBe(false);
  expect(isDatetime(new Date())).toBe(false);
});
