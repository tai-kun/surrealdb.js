import { assertEquals } from "@tools/assert";
import { ENV, test } from "@tools/test";
import { isBrowser } from "surrealjs/_internal";

test("ブラウザかどうかを判定する", () => {
  let browser: boolean;

  switch (ENV) {
    case "Chrome":
    case "Firefox":
    case "WebKit":
      browser = true;
      break;

    case "Bun":
    case "Deno":
    case "Node":
      browser = false;
      break;
  }

  assertEquals(isBrowser, browser);
});
