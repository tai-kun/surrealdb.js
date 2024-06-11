import { isBrowser } from "@tai-kun/surrealdb/_internal";
import { assertEquals } from "@tools/assert";
import { ENV, test } from "@tools/test";

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
