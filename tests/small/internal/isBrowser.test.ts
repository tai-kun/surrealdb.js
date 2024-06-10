import { assertEquals } from "@pkg/assert";
import { ENV, test } from "@pkg/test";
import { isBrowser } from "@tai-kun/surrealdb/_internal";

test("ブラウザかどうかを判定する", () => {
  let browser: boolean;

  switch (ENV) {
    case "Chrome":
    case "Firefox":
      browser = true;
      break;

    case "Bun":
    case "Deno":
    case "Node":
    case "CloudflareWorkers":
      browser = false;
      break;
  }

  assertEquals(isBrowser, browser);
});
