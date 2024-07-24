import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

let runtime = (process.env["VITEST_MODE"] || "Node.js").toLocaleLowerCase();
let browser: boolean;

switch (runtime) {
  case "test":
    runtime = "node.js";
    browser = false;
    break;

  case "node.js":
  // case "deno":
  case "bun":
    browser = false;
    break;

  case "chromium":
  case "firefox":
  case "webkit":
    browser = true;
    break;

  default:
    throw new Error(`Invalid vitest mode: ${process.env["VITEST_MODE"]}`);
}

export default defineConfig({
  test: {
    browser: {
      enabled: browser,
      provider: "playwright",
      name: runtime,
      headless: true,
      screenshotFailures: false,
    },
    include: [
      "tests/**/*.test.ts",
    ],
  },
  define: {
    "process.env.RUNTIME": JSON.stringify(runtime),
    "process.env.BROWSER": JSON.stringify(`${browser ? 1 : 0}`),
  },
  plugins: [
    tsconfigPaths() as any,
  ],
});
