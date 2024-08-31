import { isPlainObject } from "@tai-kun/surrealdb/utils";
import { expect, test } from "vitest";

test.for([
  /tai-kun/,
  function() {},
  () => {},
  "42",
  42,
  [],
  new Date(),
  null,
  undefined,
  Symbol,
  Symbol.for("foo"),
  Symbol("foo"),
  (function*() {})(),
  (async function*() {})(),
  Object.create({}),
])("%o はプレーンオブジェクトではない", o => {
  expect(isPlainObject(o)).toBe(false);
});

test.for([
  {},
  Object.create(Object.prototype),
  Object.create(null),
  new Proxy({}, {}),
])("%o はプレーンオブジェクトである", o => {
  expect(isPlainObject(o)).toBe(true);
});
