import { encode } from "@tai-kun/surrealdb/cbor";
import { CircularReferenceError } from "@tai-kun/surrealdb/errors";
import { expect, test } from "vitest";

test("オブジェクトの循環参照エラー", () => {
  const a = {};
  Object.assign(a, { a });

  expect(() => encode(a)).toThrow(CircularReferenceError);
});

test("配列の循環参照エラー", () => {
  const a: any[] = [];
  a.push(a);

  expect(() => encode(a)).toThrow(CircularReferenceError);
});

test("Map のキーの循環参照エラー", () => {
  const a = new Map();
  a.set(a, 0);

  expect(() => encode(a)).toThrow(CircularReferenceError);
});

test("Map の値の循環参照エラー", () => {
  const a = new Map();
  a.set(0, a);

  expect(() => encode(a)).toThrow(CircularReferenceError);
});

test("Set の循環参照エラー", () => {
  const a = new Set();
  a.add(a);

  expect(() => encode(a)).toThrow(CircularReferenceError);
});
