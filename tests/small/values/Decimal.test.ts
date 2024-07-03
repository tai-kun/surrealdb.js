import { isDecimal } from "@tai-kun/surreal";
import { Decimal } from "@tai-kun/surreal/values/full";
import { Decimal as DecimalStandard } from "@tai-kun/surreal/values/standard";
import { Decimal as DecimalTiny } from "@tai-kun/surreal/values/tiny";
import { assert, assertEquals, assertInstanceOf } from "@tools/assert";
import { test } from "@tools/test";

test("文字列から Decimal を作成する", () => {
  const d1 = new Decimal("3.14");
  const d2 = new DecimalStandard("3.14");
  const d3 = new DecimalTiny("3.14");

  assertEquals(d1.valueOf(), "3.14");
  assertEquals(d2.valueOf(), "3.14");
  assertEquals(d3.valueOf(), "3.14");
  assertEquals(d1.toSurql(), "3.14dec");
  assertEquals(d2.toSurql(), "3.14dec");
});

test("数値から Decimal を作成する", () => {
  const d1 = new Decimal(3.14);
  const d2 = new DecimalStandard(3.14);
  const d3 = new DecimalTiny(3.14);

  assertEquals(d1.valueOf(), "3.14");
  assertEquals(d2.valueOf(), "3.14");
  assertEquals(d3.valueOf(), "3.14");
  assertEquals(d1.toSurql(), "3.14dec");
  assertEquals(d2.toSurql(), "3.14dec");
});

test("Decimal クラスであると判定できる", () => {
  const d1 = new Decimal("3.14");
  const d2 = new DecimalStandard("3.14");
  const d3 = new DecimalTiny("3.14");

  assert(isDecimal(d1));
  assert(isDecimal(d2));
  assert(isDecimal(d3));
  assert(!isDecimal(3.14));
  assert(!isDecimal("3.14"));
});

test("decimal.js-light の静的メソッドにアクセスできる", () => {
  assertEquals(typeof DecimalStandard.ROUND_CEIL, "number");
});

test("decimal.js の静的メソッドにアクセスできる", () => {
  assertEquals(typeof Decimal.ROUND_CEIL, "number");
});

test("decimal.js-light のインスタンスメソッドにアクセスできる", () => {
  const d = new DecimalStandard("0.1").plus("0.1").plus("0.1");

  assertEquals(d.valueOf(), "0.3");
  assertInstanceOf(d, DecimalStandard);
  assert(isDecimal(d));
});

test("decimal.js のインスタンスメソッドにアクセスできる", () => {
  const d = new Decimal("0.1").plus("0.1").plus("0.1");

  assertEquals(d.valueOf(), "0.3");
  assertInstanceOf(d, Decimal);
  assert(isDecimal(d));
});
