import { SurrealTypeError } from "@tai-kun/surreal/errors";
import { isDatetime } from "@tai-kun/surreal/values";
import { Datetime as DecodeOnlyDatetime } from "@tai-kun/surreal/values/decode-only";
import { Datetime as EncodableDatetime } from "@tai-kun/surreal/values/encodable";
import { Datetime as FullDatetime } from "@tai-kun/surreal/values/full";
import { Datetime as StandardDatetime } from "@tai-kun/surreal/values/standard";
import assert from "@tools/assert";
import { describe, ENV, test } from "@tools/test";

const tests = {
  EncodableDatetime,
  FullDatetime,
};

const isFullDatetime = (x: unknown): x is typeof FullDatetime =>
  x === FullDatetime;

for (const [name, Datetime] of Object.entries(tests)) {
  describe(name, () => {
    test("現在時刻で Datetime インスタンスを作成する", () => {
      const dt = new Datetime();

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.equal(typeof dt.seconds, "number", ".seconds は数値");
      assert.equal(typeof dt.nanoseconds, "number", ".nanoseconds は数値");
      assert.equal(typeof dt.valueOf, "function", ".valueOf は関数");
      assert.equal(typeof dt.valueOf(), "number", ".valueOf() は数値を返す");
      assert.equal(typeof dt.toString, "function", ".toString は関数");
      assert.equal(typeof dt.toString(), "string", ".toString は文字列を返す");
      assert.equal(
        typeof dt[Symbol.toPrimitive],
        "function",
        "[Symbol.toPrimitive] は関数",
      );
      assert.equal(typeof (+dt), "number", "+datetime は数値になる");
      assert.equal(typeof `${dt}`, "string", "`${datetime}` は文字列になる");
    });

    test("有効な正のミリ秒時刻を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime(1717245296_780);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 780_000_000,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780000000Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.780000000Z'`,
        "SurrealQL 表現",
      );
    });

    test("有効な負のミリ秒時刻を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime(-302441103_220);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: -302441103,
          nanoseconds: -220_000_000,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "1960-06-01T12:34:56.780000000Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'1960-06-01T12:34:56.780000000Z'`,
        "SurrealQL 表現",
      );
    });

    test("無効なミリ秒時刻を指定して Datetime インスタンスを作成する", () => {
      const dt = new Datetime(NaN);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: NaN,
          nanoseconds: NaN,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.throws(
        () => dt.toJSON(),
        RangeError,
        "JSON 表現にできない",
      );
      assert.throws(
        () => dt.toSurql(),
        RangeError,
        "SurrealQL 表現にできない",
      );
    });

    test("正のナノ秒時刻を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime(1717245296_780123456n);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 780123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("負のナノ秒時刻を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime(-302441103_220000000n);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: -302441103,
          nanoseconds: -220_000_000,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "1960-06-01T12:34:56.780000000Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'1960-06-01T12:34:56.780000000Z'`,
        "SurrealQL 表現",
      );
    });

    test("Date の範囲外のナノ秒時刻を指定して Datetime インスタンスを作成する", () => {
      const MAX_DATE_INT_MS = 8.64e15;
      const MAX_DATE_BIGINT_MS = BigInt(MAX_DATE_INT_MS);
      const MAX_DATE_BIGINT_NS = MAX_DATE_BIGINT_MS * 1_000_000n;
      const OVERFLOWED_DATE_BIGINT_NS = MAX_DATE_BIGINT_NS + 1_000_000n; // +1ms
      const dt = new Datetime(OVERFLOWED_DATE_BIGINT_NS);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: NaN,
          nanoseconds: NaN,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.throws(
        () => dt.toJSON(),
        RangeError,
        "JSON 表現にできない",
      );
      assert.throws(
        () => dt.toSurql(),
        RangeError,
        "SurrealQL 表現にできない",
      );
    });

    test("文字列を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime("2024-06-01T12:34:56.780123456789Z");

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 780_123_456, // ナノ秒未満の精度は消える
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("WebKit ではミリ秒未満の精度が丸められる", {
      skip: ENV !== "WebKit",
    }, () => {
      const dt = new Date("1969-12-31T23:59:59.9991Z");

      assert.equal(dt.getTime(), 0, "time");
      assert.equal(dt.toISOString(), "1970-01-01T00:00:00.000Z", "ISO");
    });

    test("WebKit 以外ではミリ秒未満の精度が丸められずに切り捨てられる", {
      skip: ENV === "WebKit",
    }, () => {
      const dt = new Date("1969-12-31T23:59:59.9991Z");

      assert.equal(dt.getTime(), -1, "time");
      assert.equal(dt.toISOString(), "1969-12-31T23:59:59.999Z", "ISO");
    });

    test("UNIXエポック以前の文字列を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime("1960-06-01T12:34:56.780123456789Z");

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: -302441103,
          nanoseconds: -219_876_544, // ナノ秒未満の精度は消える
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(
        dt.toJSON(),
        "1960-06-01T12:34:56.780123456Z",
        "JSON 表現",
      );
      assert.equal(
        dt.toSurql(),
        `d'1960-06-01T12:34:56.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("無効な文字列を指定して Datetime インスタンスを作成する", () => {
      const dt = new Datetime("2024年の6月ついたち、正午すぎ");

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: NaN,
          nanoseconds: NaN,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.throws(
        () => dt.toJSON(),
        RangeError,
        "JSON 表現にできない",
      );
      assert.throws(
        () => dt.toSurql(),
        RangeError,
        "SurrealQL 表現にできない",
      );
    });

    test("Date オブジェクトを指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const d = new Date("2024-06-01T12:34:56.780Z");
      const dt = new Datetime(d);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 780_000_000,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780000000Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.780000000Z'`,
        "SurrealQL 表現",
      );
    });

    test("UNIXエポック以前の Date オブジェクトを指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const d = new Date("1960-06-01T12:34:56.780Z");
      const dt = new Datetime(d);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: -302441103,
          nanoseconds: -220_000_000,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "1960-06-01T12:34:56.780000000Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'1960-06-01T12:34:56.780000000Z'`,
        "SurrealQL 表現",
      );
    });

    test("Invalid Date を指定して Datetime インスタンスを作成する", () => {
      const d = new Date(NaN);
      const dt = new Datetime(d);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: NaN,
          nanoseconds: NaN,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.throws(
        () => dt.toJSON(),
        RangeError,
        "JSON 表現にできない",
      );
      assert.throws(
        () => dt.toSurql(),
        RangeError,
        "SurrealQL 表現にできない",
      );
    });

    test("配列を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime([1717245296, 780123456]);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 780123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("ナノ秒時刻がオーバーフローした配列を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime([undefined, 61_780123456]);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 61,
          nanoseconds: 780123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "1970-01-01T00:01:01.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'1970-01-01T00:01:01.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("負のナノ秒時刻を持つ配列を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime([61, -61_000000000]);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 0,
          nanoseconds: 0,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "1970-01-01T00:00:00.000000000Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'1970-01-01T00:00:00.000000000Z'`,
        "SurrealQL 表現",
      );
    });

    test("秒時刻がオーバーフローした配列を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const MAX_DATE_INT_MS = 8.64e15;
      const dt = new Datetime([MAX_DATE_INT_MS, 1_000_000]);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: NaN,
          nanoseconds: NaN,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.throws(
        () => dt.toJSON(),
        RangeError,
        "JSON 表現にできない",
      );
      assert.throws(
        () => dt.toSurql(),
        RangeError,
        "SurrealQL 表現にできない",
      );
    });

    test("オブジェクトを指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const o = {
        seconds: 1717245296,
        nanoseconds: 780123456,
      };
      const dt = new Datetime(o);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 780123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("年月日等を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime(2024, 6 - 1, 1, 12, 34, 56, 780, 123, 456);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 780123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("必須要素のない年月日等を指定して Datetime インスタンスを作成できない", () => {
      assert.throws(
        () => new Datetime(2024, 6 - 1, 1, 12, 34, 56, undefined, 123),
        SurrealTypeError,
      );
    });

    test("オーバーフローした値を持つ年月日等を指定してエンコード可能な Datetime インスタンスを作成する", () => {
      const dt = new Datetime(2024, 6 - 1, 1, 12, 34, 56, 780, 321_123, 456);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245297,
          nanoseconds: 101123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:57.101123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:57.101123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("インスタンスを複製する", () => {
      const o = new Datetime([1717245296, 780123456]);
      const dt = new Datetime(o);

      assert(dt instanceof Datetime, "Datetime インスタンス");
      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 780123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("西暦 1 万年以降には `+` プレフィクスが付く", () => {
      const dt = new Datetime(10_000, 6 - 1, 1, 12, 34, 56, 780, 123, 456);

      assert.equal(
        dt.toJSON(),
        "+010000-06-01T12:34:56.780123456Z",
        "JSON 表現",
      );
      assert.throws(
        () => dt.toSurql(),
        SurrealTypeError,
        "SurrelQL では拡張表現が許可されない",
      );
    });

    test("西暦 0 年", () => {
      const dt = new Datetime(-62167219200000);

      assert.equal(
        dt.toJSON(),
        "0000-01-01T00:00:00.000000000Z",
        "JSON 表現",
      );
      assert.equal(
        dt.toSurql(),
        `d'0000-01-01T00:00:00.000000000Z'`,
        "SurrealQL 表現",
      );
    });

    test("紀元前には `-` プレフィクスが付く", () => {
      const dt = new Datetime(-62167219200000 - 1);

      assert.equal(
        dt.toJSON(),
        "-000001-12-31T23:59:59.999000000Z",
        "JSON 表現",
      );
      assert.throws(
        () => dt.toSurql(),
        SurrealTypeError,
        "SurrelQL では拡張表現が許可されない",
      );
    });

    /***************************************************************************
     *
     * FullDatetime
     *
     **************************************************************************/

    if (!isFullDatetime(Datetime)) {
      return;
    }

    test("秒時刻を有効な秒時刻で上書きする", () => {
      const dt = new Datetime([1717245296, 780123456]);
      dt.seconds = 61.9; // 小数点以下切り捨て

      assert.deepEqual(
        dt.structure(),
        {
          seconds: 61,
          nanoseconds: 780123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "1970-01-01T00:01:01.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'1970-01-01T00:01:01.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("秒時刻を無効な秒時刻で上書きする", () => {
      const dt = new Datetime([1717245296, 780123456]);
      dt.seconds = NaN;

      assert.deepEqual(
        dt.structure(),
        {
          seconds: NaN,
          nanoseconds: NaN,
        },
        "秒時刻とナノ秒時刻",
      );
      assert(dt.isInvalid(), "無効な日付であると判定");
      assert.throws(
        () => dt.toJSON(),
        RangeError,
        "JSON 表現にできない",
      );
      assert.throws(
        () => dt.toSurql(),
        RangeError,
        "SurrealQL 表現にできない",
      );
    });

    test("秒時刻を負の秒時刻で上書きする", () => {
      const dt = new Datetime([1717245296, 780123456]);
      dt.seconds = -1.9; // 小数点以下切り捨て

      assert.deepEqual(
        dt.structure(),
        {
          seconds: 0,
          nanoseconds: -219876544,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "1969-12-31T23:59:59.780123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'1969-12-31T23:59:59.780123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("ナノ秒時刻を有効なナノ秒時刻で上書きする", () => {
      const dt = new Datetime([1717245296, 780123456]);
      dt.nanoseconds = 123456;

      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245296,
          nanoseconds: 123456,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.000123456Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:56.000123456Z'`,
        "SurrealQL 表現",
      );
    });

    test("ナノ秒時刻を無効なナノ秒時刻で上書きする", () => {
      const dt = new Datetime([1717245296, 780123456]);
      dt.nanoseconds = NaN;

      assert.deepEqual(
        dt.structure(),
        {
          seconds: NaN,
          nanoseconds: NaN,
        },
        "秒時刻とナノ秒時刻",
      );
      assert(dt.isInvalid(), "無効な日付であると判定");
      assert.throws(
        () => dt.toJSON(),
        RangeError,
        "JSON 表現にできない",
      );
      assert.throws(
        () => dt.toSurql(),
        RangeError,
        "SurrealQL 表現にできない",
      );
    });

    test("ナノ秒時刻を負のナノ秒時刻で上書きする", () => {
      const dt = new Datetime([1717245296, 780123456]);
      dt.nanoseconds = -1.9; // 小数点以下切り捨て

      assert.deepEqual(
        dt.structure(),
        {
          seconds: 1717245295,
          nanoseconds: 999999999,
        },
        "秒時刻とナノ秒時刻",
      );
      assert.equal(dt.toJSON(), "2024-06-01T12:34:55.999999999Z", "JSON 表現");
      assert.equal(
        dt.toSurql(),
        `d'2024-06-01T12:34:55.999999999Z'`,
        "SurrealQL 表現",
      );
    });

    test("コンパクト表現を取得できる", () => {
      const dt = new Datetime([1717245296, 780123456]);

      assert.deepEqual(dt.getCompact(), [1717245296, 780123456]);
    });

    test("コンパクト表現で日付を再設定できる", () => {
      const dt = new Datetime(0);
      const time = dt.setCompact([1717245296, 780123456]);

      assert.equal(time, 1717245296_780, "ミリ秒時刻");
      assert.deepEqual(dt.getCompact(), [1717245296, 780123456], "コンパクト");
    });

    test("ミリ秒を取得できる", () => {
      const dt = new Datetime([1717245296, 780123456]);

      assert.equal(dt.getMilliseconds(), 780, "local");
      assert.equal(dt.getUTCMilliseconds(), 780, "UTC");
    });

    test("小さな正のミリ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCMilliseconds(123);

      assert.equal(time, 1717245296_123, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.123123456Z", "JSON 表現");
    });

    test("小さな負のミリ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCMilliseconds(-1);

      assert.equal(time, 1717245295_999, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:55.999123456Z", "JSON 表現");
    });

    test("大きな正のミリ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCMilliseconds(1_000);

      assert.equal(time, 1717245297_000, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:57.000123456Z", "JSON 表現");
    });

    test("大きな負のミリ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCMilliseconds(-1_000);

      assert.equal(time, 1717245295_000, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:55.000123456Z", "JSON 表現");
    });

    test("マイクロ秒を取得できる", () => {
      const dt = new Datetime([1717245296, 780123456]);

      assert.equal(dt.getMicroseconds(), 123, "local");
      assert.equal(dt.getUTCMicroseconds(), 123, "UTC");
    });

    test("小さな正のマイクロ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCMicroseconds(780);

      assert.equal(time, 1717245296_780, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780780456Z", "JSON 表現");
    });

    test("小さな負のマイクロ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCMicroseconds(-1);

      assert.equal(time, 1717245296_779, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.779999456Z", "JSON 表現");
    });

    test("大きな正のマイクロ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCMicroseconds(1_000);

      assert.equal(time, 1717245296_781, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.781000456Z", "JSON 表現");
    });

    test("大きな負のマイクロ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCMicroseconds(-1_000);

      assert.equal(time, 1717245296_779, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.779000456Z", "JSON 表現");
    });

    test("ナノ秒を取得できる", () => {
      const dt = new Datetime([1717245296, 780123456]);

      assert.equal(dt.getNanoseconds(), 456, "local");
      assert.equal(dt.getUTCNanoseconds(), 456, "UTC");
    });

    test("小さな正のナノ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCNanoseconds(780);

      assert.equal(time, 1717245296_780, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780123780Z", "JSON 表現");
    });

    test("小さな負のナノ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCNanoseconds(-1);

      assert.equal(time, 1717245296_780, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780122999Z", "JSON 表現");
    });

    test("大きな正のナノ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCNanoseconds(1_000);

      assert.equal(time, 1717245296_780, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780124000Z", "JSON 表現");
    });

    test("大きな負のナノ秒を設定できる", () => {
      const dt = new Datetime([1717245296, 780123456]);
      const time = dt.setUTCNanoseconds(-1_000);

      assert.equal(time, 1717245296_780, "ミリ秒時刻");
      assert.equal(dt.toJSON(), "2024-06-01T12:34:56.780122000Z", "JSON 表現");
    });
  });
}

test("Datetime クラスであると判定できる", () => {
  assert(isDatetime(new DecodeOnlyDatetime()), "DecodeOnlyDatetime");
  assert(isDatetime(new EncodableDatetime()), "EncodableDatetime");
  assert(isDatetime(new StandardDatetime()), "StandardDatetime");
  assert(isDatetime(new FullDatetime()), "FullDatetime");

  assert(!isDatetime(new Date()), "Date");
  assert(!isDatetime({}), "オブジェクト");
  assert(!isDatetime("2024-06-01T12:34:56Z"), "文字列");
});
