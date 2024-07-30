import { isArrayBuffer } from "@tai-kun/surrealdb/utils";
import { expect, test } from "vitest";

test("ArrayBuffer であると判定する", async () => {
  const resp = new Response();
  const buff = await resp.arrayBuffer();

  expect(isArrayBuffer(buff)).toBe(true);
});
