import { isBrowser } from "@tai-kun/surrealdb/utils";
import { expect, test } from "vitest";

test("ブラウザかどうかを判定する", () => {
  expect(isBrowser()).toBe(process.env.BROWSER === "1");
});
