import { Datetime, isDatetime } from "@tai-kun/surrealdb/full";
import { Datetime as DatetimeStandard } from "@tai-kun/surrealdb/standard";
import { Datetime as DatetimeTiny } from "@tai-kun/surrealdb/tiny";
import { assert, assertEquals } from "@tools/assert";
import { test } from "@tools/test";

test("現在時刻の Datetime を作成する", () => {
  const dt = new Datetime();

  assert(dt.getTime() <= Date.now());
});

test("ミリ秒数を指定して Datetime を作成する", () => {
  const dt = new Datetime(1717245296_780);

  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:56.780000000Z"`);
});

test("文字列を指定して Datetime を作成する", () => {
  const dt = new Datetime("2024-06-01T12:34:56.780Z");

  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:56.780000000Z"`);
});

test("Date オブジェクトを指定して Datetime を作成する", () => {
  const d = new Date(1717245296_780);
  const dt = new Datetime(d);

  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:56.780000000Z"`);
});

test("秒とナノ秒を指定して Datetime を作成する", () => {
  const dt = new Datetime([1717245296, 780_123_456]);

  assertEquals(dt.getTime(), 1717245296_780);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:56.780123456Z"`);
});

test("範囲内の正のナノ秒で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setUTCNanoseconds(1_123_456);

  assertEquals(ms, 1717245296_001);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:56.001123456Z"`);
});

test("範囲外の正のナノ秒で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setUTCNanoseconds(1_123_456_789);

  assertEquals(ms, 1717245297_123);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:57.123456789Z"`);
});

test("範囲内の負のナノ秒で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setUTCNanoseconds(-1);

  assertEquals(ms, 1717245295_999);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:55.999999999Z"`);
});

test("範囲外の負のナノ秒で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setUTCNanoseconds(-6_000_000_000);

  assertEquals(ms, 1717245290_000);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:50.000000000Z"`);
});

test("ミリ秒の Unix 時刻で Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setTime(1717245296_123);

  assertEquals(ms, 1717245296_123);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:56.123000000Z"`);
});

test("ミリ秒を指定して Datetime を更新する", () => {
  const dt = new Datetime(1717245296_780);
  const ms = dt.setMilliseconds(456);

  assertEquals(ms, 1717245296_456);
  assertEquals(dt.toSurql(), `d"2024-06-01T12:34:56.456000000Z"`);
});

test("Datetime クラスであると判定できる", () => {
  assert(isDatetime(new Datetime()));
  assert(isDatetime(new DatetimeTiny()));
  assert(isDatetime(new DatetimeStandard()));

  assert(!isDatetime(new Date()));
  assert(!isDatetime({}));
  assert(!isDatetime("2024-06-01T12:34:56Z"));
});
