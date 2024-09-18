import type { LiveResult } from "@tai-kun/surrealdb";
import { isLiveResult } from "@tai-kun/surrealdb/utils";
import { expect, test } from "vitest";

test("正しい LiveResult オブジェクトを渡すと true を返す", () => {
  const result = isLiveResult(
    {
      id: "validId",
      action: "CREATE",
      record: "validRecord",
      result: {
        id: "user:ichiro",
      },
    } satisfies LiveResult,
  );

  expect(result).toBe(true);
});

test("null を渡すと false を返す", () => {
  const result = isLiveResult(null);

  expect(result).toBe(false);
});

test("undefined を渡すと false を返す", () => {
  const result = isLiveResult(undefined);

  expect(result).toBe(false);
});

test("オブジェクト以外の値を渡すと false を返す（数値）", () => {
  const result = isLiveResult(123);

  expect(result).toBe(false);
});

test("オブジェクト以外の値を渡すと false を返す（文字列）", () => {
  const result = isLiveResult("string");

  expect(result).toBe(false);
});

test("id が存在しないオブジェクトを渡すと false を返す", () => {
  const result = isLiveResult({
    action: "CREATE",
    record: "validRecord",
    result: { data: "validData" },
  });

  expect(result).toBe(false);
});

test("action が正しくないオブジェクトを渡すと false を返す", () => {
  const result = isLiveResult({
    id: "validId",
    action: "INVALID_ACTION",
    record: "validRecord",
    result: { data: "validData" },
  });

  expect(result).toBe(false);
});

test("record が存在しないオブジェクトを渡すと false を返す", () => {
  const result = isLiveResult({
    id: "validId",
    action: "CREATE",
    result: { data: "validData" },
  });

  expect(result).toBe(false);
});

test("result が null のオブジェクトを渡すと false を返す", () => {
  const result = isLiveResult({
    id: "validId",
    action: "CREATE",
    record: "validRecord",
    result: null,
  });

  expect(result).toBe(false);
});

test("id が string でなくオブジェクトでもない場合 false を返す", () => {
  const result = isLiveResult({
    id: 123, // 数値
    action: "CREATE",
    record: "validRecord",
    result: { data: "validData" },
  });

  expect(result).toBe(false);
});

test("result が string やオブジェクトでなくても false を返す", () => {
  const result = isLiveResult({
    id: "validId",
    action: "CREATE",
    record: "validRecord",
    result: "invalidResult", // string は許可されていない
  });

  expect(result).toBe(false);
});
