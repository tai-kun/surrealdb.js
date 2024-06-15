import { Decimal, isDecimal } from "@tai-kun/surrealdb/full";
import { Decimal as DecimalStandard } from "@tai-kun/surrealdb/standard";
import { Decimal as DecimalTiny } from "@tai-kun/surrealdb/tiny";
import { assert, assertEquals } from "@tools/assert";
import { test } from "@tools/test";

test("文字列から Decimal を作成する", () => {
  const d1 = new Decimal("3.14");
  const d2 = new DecimalStandard("3.14");
  const d3 = new DecimalTiny("3.14");

  assertEquals(d1.valueOf(), "3.14");
  assertEquals(d2.valueOf(), "3.14");
  assertEquals(d3.valueOf(), "3.14");
});

test("数値から Decimal を作成する", () => {
  const d1 = new Decimal(3.14);
  const d2 = new DecimalStandard(3.14);
  const d3 = new DecimalTiny(3.14);

  assertEquals(d1.valueOf(), "3.14");
  assertEquals(d2.valueOf(), "3.14");
  assertEquals(d3.valueOf(), "3.14");
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
