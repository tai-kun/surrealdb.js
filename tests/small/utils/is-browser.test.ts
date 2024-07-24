import { isBrowser } from "@tai-kun/surreal/utils";
import { expect, test } from "vitest";

test("ブラウザかどうかを判定する", () => {
  expect(isBrowser).toBe(process.env.BROWSER === "1");
});
