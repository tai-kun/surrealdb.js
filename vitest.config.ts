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
  esbuild: {
    target: "safari15", // static を使うために必要なオプション
  },
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
    coverage: {
      include: ["src/**/*"],
      reporter: process.env["CI"]
        ? ["json", "text-summary", "text"]
        : ["html", "text-summary"],
    },
    setupFiles: [
      "scripts/vitest-helpful-error.js",
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
