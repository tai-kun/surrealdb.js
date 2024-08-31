import { getTypeName } from "@tai-kun/surrealdb/errors";
import { test } from "vitest";

test.for<[target: unknown, typeName: string]>([
  [null, "null"],
  [undefined, "undefined"],
  [0, "Number"],
  [0n, "BigInt"],
  ["a", "String"],
  [true, "Boolean"],
  [false, "Boolean"],
  [Symbol("a"), "Symbol"],
  [Symbol.for("a"), "Symbol"],
  [() => {}, "Function"],
  [function*() {}, "GeneratorFunction"],
  [async function*() {}, "AsyncGeneratorFunction"],
  [Promise.resolve(), "Promise"],
  [/a/, "RegExp"],
  [new Date(), "Date"],
  [[], "Array"],
  [{}, "Object"],
  [new URL("http://example.com"), "URL"],
])("%o の型名は %s", ([target, typeName], { expect }) => {
  expect(getTypeName(target)).toBe(typeName);
});
