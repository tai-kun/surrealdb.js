import process from "node:process";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

let runtime = (process.env["VITEST_MODE"] || "Node.js").toLowerCase();
let browser: boolean;

switch (runtime) {
  case "node.js":
  case "deno":
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

let providerOptions = {};

switch (runtime) {
  case "chromium":
    providerOptions = {
      launch: {
        args: ["--disable-web-security"],
      },
      // context: {
      //   bypassCSP: true,
      // },
    };
    break;

  case "firefox":
    break;

  case "webkit":
    break;
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
      providerOptions,
      screenshotFailures: false,
    },
    include: [
      "tests/**/*.test.ts",
    ],
    coverage: {
      include: ["src/**/*"],
      provider: "istanbul",
      reporter: process.env["CI"]
        ? ["json", "text-summary", "text"]
        : ["html", "text-summary"],
      reportsDirectory: `coverage/${runtime}`,
    },
    setupFiles: [
      "scripts/vitest-helpful-error.js",
    ],
  },
  define: {
    __DEV__: "true",
    "process.env.RUNTIME": JSON.stringify(runtime),
    "process.env.BROWSER": JSON.stringify(`${browser ? 1 : 0}`),
  },
  plugins: [
    tsconfigPaths() as any,
  ],
});
