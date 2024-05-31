/**
 * This script bundles the test code for the browser, integrates it with the test runner,
 * and generates a script that can be executed in Node.js.
 */

import { build } from "esbuild";
import fs from "node:fs";
import { dirname, relative, resolve } from "node:path";

const { outputFiles } = await build({
  bundle: true,
  entryPoints: fs.globSync("tests/**/*.test.ts"),
  format: "esm",
  outbase: "tests",
  outdir: "tests",
  platform: "browser",
  target: "es2020",
  write: false,
  lineLimit: 80,
  external: [
    "undici",
    "ws",
  ],
});
const testRunner = fs.readFileSync("browser.js");
const useSurrealDb = resolve("use-surrealdb.js");
await Promise.all(outputFiles.map(async ({ path, text }) => {
  const testCode = [
    // Set up the SurrealDB environment if necessary
    text.match(/globalThis\.__USE_SURREALDB__\s*=\s*true\b/)
      ? `import "${relative(dirname(path), useSurrealDb)}";`
      : "",
    // Inject the bundled test code
    `const BUNDLED_TEST_CODE = ${JSON.stringify(text)};`,
    // Inject the test runner
    testRunner,
  ];
  await fs.promises.writeFile(path, testCode.join("\n"));
}));
