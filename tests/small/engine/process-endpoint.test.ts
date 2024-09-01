import {
  processEndpoint,
  type ProcessEndpointOptions,
} from "@tai-kun/surrealdb/engine";
import { expect, test } from "vitest";

test("transformEndpoint が 'preserve' でない場合、エンドポイントが /rpc で終わっていなければ /rpc を追加する", () => {
  const endpoint = "https://example.com/api";
  const expected = "https://example.com/api/rpc";

  const result = processEndpoint(endpoint);

  expect(result.toString()).toBe(expected);
});

test("エンドポイントがすでに /rpc で終わっている場合、何も追加しない", () => {
  const endpoint = "https://example.com/api/rpc";
  const expected = "https://example.com/api/rpc";

  const result = processEndpoint(endpoint);

  expect(result.toString()).toBe(expected);
});

test("エンドポイントが / で終わっていない場合、/rpc を追加する前に / を追加する", () => {
  const endpoint = "https://example.com/api";
  const expected = "https://example.com/api/rpc";

  const result = processEndpoint(endpoint);

  expect(result.toString()).toBe(expected);
});

test("transformEndpoint が 'preserve' に設定されている場合、エンドポイントを変更しない", () => {
  const endpoint = "https://example.com/api";
  const options: ProcessEndpointOptions = { transformEndpoint: "preserve" };
  const expected = "https://example.com/api";

  const result = processEndpoint(endpoint, options);

  expect(result.toString()).toBe(expected);
});

test("URL インスタンスを入力として正しく処理する", () => {
  const endpoint = new URL("https://example.com/api");
  const expected = "https://example.com/api/rpc";

  const result = processEndpoint(endpoint);

  expect(result.toString()).toBe(expected);
});
