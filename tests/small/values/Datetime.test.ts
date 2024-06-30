import { assert, assertEquals, assertThrows } from "@tools/assert";
import { test } from "@tools/test";
import { isDatetime } from "surreal-js";
import { Datetime } from "surreal-js/full";
import { Datetime as DatetimeStandard } from "surreal-js/standard";
import { Datetime as DatetimeTiny } from "surreal-js/tiny";

test("現在時刻の Datetime を作成する", () => {
  const dt = new Datetime();

  assert(dt.getTime() <= Date.now());
});

test("ミリ秒数を指定して Datetime を作成する", () => {
  const dt = new Datetime(1717245296_780);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.780000000Z'`);
  assertEquals(dt.getMilliseconds(), 780);
  assertEquals(dt.getMicroseconds(), 0);
  assertEquals(dt.getNanoseconds(), 0);
});

test("文字列を指定して Datetime を作成する", () => {
  const dt = new Datetime("2024-06-01T12:34:56.780Z");

  assertEquals(dt.seconds, 1717245296);
  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.780000000Z'`);
  assertEquals(dt.getMilliseconds(), 780);
  assertEquals(dt.getMicroseconds(), 0);
  assertEquals(dt.getNanoseconds(), 0);
});

test("Date オブジェクトを指定して Datetime を作成する", () => {
  const d = new Date(1717245296_780);
  const dt = new Datetime(d);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.780000000Z'`);
  assertEquals(dt.getMilliseconds(), 780);
  assertEquals(dt.getMicroseconds(), 0);
  assertEquals(dt.getNanoseconds(), 0);
});

test("秒と範囲内のナノ秒を指定して Datetime を作成する", () => {
  const dt = new Datetime([1717245296, 780_123_456]);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.780123456Z'`);
  assertEquals(dt.getMilliseconds(), 780);
  assertEquals(dt.getMicroseconds(), 123);
  assertEquals(dt.getNanoseconds(), 456);
});

test("秒と範囲外のナノ秒を指定して Datetime を作成する", () => {
  const dt = new Datetime([1717245296, 4_123_456_789]);

  assertEquals(dt.seconds, 1717245300);
  assertEquals(dt.getTime(), 1717245300_123);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:35:00.123456789Z'`);
  assertEquals(dt.getMilliseconds(), 123);
  assertEquals(dt.getMicroseconds(), 456);
  assertEquals(dt.getNanoseconds(), 789);
});

test("各種範囲内のパラメーターを指定して Datetime を作成する", () => {
  const dt = new Datetime(2024, 5, 1, 12, 34, 56, 780, 123, 456);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.780123456Z'`);
  assertEquals(dt.getMilliseconds(), 780);
  assertEquals(dt.getMicroseconds(), 123);
  assertEquals(dt.getNanoseconds(), 456);
});

test("各種範囲外のパラメーターを指定して Datetime を作成する", () => {
  const dt = new Datetime(2024, 5, 1, 12, 34, 56, 780, 123, 900_789);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(dt.getTime(), 1717245296_781);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.781023789Z'`);
  assertEquals(dt.getMilliseconds(), 781);
  assertEquals(dt.getMicroseconds(), 23);
  assertEquals(dt.getNanoseconds(), 789);
});

test("秒で時刻を更新できる", () => {
  const dt = new Datetime("2024-06-01T12:34:56.780Z");
  dt.seconds = 1717245297;

  assertEquals(dt.seconds, 1717245297);
  assertEquals(dt.getTime(), 1717245297_780);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:57.780000000Z'`);
  assertEquals(dt.getMilliseconds(), 780);
  assertEquals(dt.getMicroseconds(), 0);
  assertEquals(dt.getNanoseconds(), 0);
});

test("範囲内のナノ秒で時刻を更新できる", () => {
  const dt = new Datetime("2024-06-01T12:34:56.780Z");
  dt.nanoseconds = 123_456_789;

  assertEquals(dt.seconds, 1717245296);
  assertEquals(dt.getTime(), 1717245296_123);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.123456789Z'`);
  assertEquals(dt.getMilliseconds(), 123);
  assertEquals(dt.getMicroseconds(), 456);
  assertEquals(dt.getNanoseconds(), 789);
});

test("範囲外のナノ秒で時刻を更新できる", () => {
  const dt = new Datetime("2024-06-01T12:34:56.780Z");
  dt.nanoseconds = 1_123_456_789;

  assertEquals(dt.seconds, 1717245297);
  assertEquals(dt.getTime(), 1717245297_123);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:57.123456789Z'`);
  assertEquals(dt.getMilliseconds(), 123);
  assertEquals(dt.getMicroseconds(), 456);
  assertEquals(dt.getNanoseconds(), 789);
});

test("範囲内の正のナノ秒で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setNanoseconds(1_123_456);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(ms, 1717245296_781);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.781123456Z'`);
  assertEquals(dt.getMilliseconds(), 781);
  assertEquals(dt.getMicroseconds(), 123);
  assertEquals(dt.getNanoseconds(), 456);
});

test("範囲外の正のナノ秒で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setNanoseconds(1_123_456_789);

  assertEquals(dt.seconds, 1717245297);
  assertEquals(ms, 1717245297_903);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:57.903456789Z'`);
  assertEquals(dt.getMilliseconds(), 903);
  assertEquals(dt.getMicroseconds(), 456);
  assertEquals(dt.getNanoseconds(), 789);
});

test("範囲内の負のナノ秒で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setNanoseconds(-1);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(ms, 1717245296_779);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.779999999Z'`);
  assertEquals(dt.getMilliseconds(), 779);
  assertEquals(dt.getMicroseconds(), 999);
  assertEquals(dt.getNanoseconds(), 999);
});

test("範囲外の負のナノ秒で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setNanoseconds(-5_000_000_000);

  assertEquals(dt.seconds, 1717245291);
  assertEquals(ms, 1717245291_780);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:51.780000000Z'`);
  assertEquals(dt.getMilliseconds(), 780);
  assertEquals(dt.getMicroseconds(), 0);
  assertEquals(dt.getNanoseconds(), 0);
});

test("ミリ秒時刻で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setTime(1717245296_123);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(ms, 1717245296_123);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.123000000Z'`);
  assertEquals(dt.getMilliseconds(), 123);
  assertEquals(dt.getMicroseconds(), 0);
  assertEquals(dt.getNanoseconds(), 0);
});

test("範囲内のミリ秒を指定して Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setMilliseconds(456);

  assertEquals(dt.seconds, 1717245296);
  assertEquals(ms, 1717245296_456);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:56.456000000Z'`);
  assertEquals(dt.getMilliseconds(), 456);
  assertEquals(dt.getMicroseconds(), 0);
  assertEquals(dt.getNanoseconds(), 0);
});

test("範囲外のミリ秒を指定して Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setMilliseconds(1_000);

  assertEquals(dt.seconds, 1717245297);
  assertEquals(ms, 1717245297_000);
  assertEquals(dt.toSurql(), `d'2024-06-01T12:34:57.000000000Z'`);
  assertEquals(dt.getMilliseconds(), 0);
  assertEquals(dt.getMicroseconds(), 0);
  assertEquals(dt.getNanoseconds(), 0);
});

test("Datetime クラスであると判定できる", () => {
  assert(isDatetime(new Datetime()));
  assert(isDatetime(new DatetimeTiny()));
  assert(isDatetime(new DatetimeStandard()));

  assert(!isDatetime(new Date()));
  assert(!isDatetime({}));
  assert(!isDatetime("2024-06-01T12:34:56Z"));
});

test("無効な日時でありながら文字列にしようとするとエラーになる", () => {
  assertThrows(
    () => {
      new Datetime(NaN).toISOString();
    },
    RangeError,
  );
});
