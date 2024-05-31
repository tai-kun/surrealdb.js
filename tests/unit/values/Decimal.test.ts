"use prelude";

import { Decimal, isDecimal } from "@tai-kun/surrealdb";
import { Decimal as FullDecimal } from "@tai-kun/surrealdb/full";
import { Decimal as TinyDecimal } from "@tai-kun/surrealdb/tiny";
import DecimalJs from "decimal.js";
import DecimalJsLight from "decimal.js-light";

test("should check if a value is a decimal", () => {
  assert(isDecimal(new Decimal("1")));
  assert(isDecimal(new FullDecimal("1")));
  assert(isDecimal(new TinyDecimal("1")));
  assert(!isDecimal({}));
  assert(!isDecimal(1));
  assert(!isDecimal("1"));
  assert(!isDecimal(new DecimalJs("1")));
  assert(!isDecimal(new DecimalJsLight("1")));
});
