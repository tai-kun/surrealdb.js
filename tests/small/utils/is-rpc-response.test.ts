import type { RpcResponse } from "@tai-kun/surrealdb";
import { isRpcResponse } from "@tai-kun/surrealdb/utils";
import { expect, test } from "vitest";

test("null や undefined は RpcResponse ではない", () => {
  expect(isRpcResponse(null)).toBe(false);
  expect(isRpcResponse(undefined)).toBe(false);
});

test("プリミティブな型 (文字列、数値、ブーリアン) は RpcResponse ではない", () => {
  expect(isRpcResponse(42)).toBe(false);
  expect(isRpcResponse(true)).toBe(false);
  expect(isRpcResponse("string")).toBe(false);
});

test("id プロパティーがない場合、RpcResponse とみなす (他の条件が満たされていれば)", () => {
  const response: RpcResponse = { result: "data" };

  expect(isRpcResponse(response)).toBe(true);
});

test("id プロパティーがあるが文字列ではない場合、RpcResponse ではない", () => {
  // @ts-expect-error 正しくない形式を検証するので、型エラーが期待される
  const response: RpcResponse = { id: 123, result: "data" };

  expect(isRpcResponse(response)).toBe(false);
});

test("id プロパティーが文字列であれば RpcResponse とみなす (他の条件が満たされていれば)", () => {
  // @ts-expect-error 正しくない形式を検証するので、型エラーが期待される
  const response: RpcResponse = { id: "123", result: "data" };

  expect(isRpcResponse(response)).toBe(true);
});

test("result プロパティーがあり、error プロパティーがない場合、RpcResponse とみなす", () => {
  const response: RpcResponse = { result: "data" };

  expect(isRpcResponse(response)).toBe(true);
});

test("result プロパティーがあり、error プロパティーもある場合、RpcResponse ではない", () => {
  // @ts-expect-error 正しくない形式を検証するので、型エラーが期待される
  const response: RpcResponse = {
    result: "data",
    error: { code: 123, message: "エラー" },
  };

  expect(isRpcResponse(response)).toBe(false);
});

test("error プロパティーがあるが、code が数値ではない場合、RpcResponse ではない", () => {
  // @ts-expect-error 正しくない形式を検証するので、型エラーが期待される
  const response: RpcResponse = { error: { code: "123", message: "エラー" } };

  expect(isRpcResponse(response)).toBe(false);
});

test("error プロパティーがあるが、message が文字列ではない場合、RpcResponse ではない", () => {
  // @ts-expect-error 正しくない形式を検証するので、型エラーが期待される
  const response: RpcResponse = { error: { code: 123, message: 456 } };

  expect(isRpcResponse(response)).toBe(false);
});

test("error プロパティーが正しい形式であれば RpcResponse とみなす", () => {
  const response: RpcResponse = { error: { code: 123, message: "エラー" } };

  expect(isRpcResponse(response)).toBe(true);
});

test("error プロパティーがオブジェクトではない場合、RpcResponse ではない", () => {
  // @ts-expect-error 正しくない形式を検証するので、型エラーが期待される
  const response: RpcResponse = { error: "some error" };

  expect(isRpcResponse(response)).toBe(false);
});

test("空のオブジェクトは RpcResponse ではない", () => {
  // @ts-expect-error 正しくない形式を検証するので、型エラーが期待される
  const response: RpcResponse = {};

  expect(isRpcResponse(response)).toBe(false);
});
