import { build } from "esbuild";
import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export async function browserify({ target }) {
  const { outputFiles } = await build({
    bundle: true,
    entryPoints: fs.globSync("tests/**/*.test.js"),
    format: "esm",
    outbase: "tests",
    outdir: "tests",
    platform: "browser",
    target,
    write: false,
    external: [
      "undici",
      "ws",
    ],
  });
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const runnerCode = fs.readFileSync(join(__dirname, "runner-code.js"), "utf8");
  await Promise.all(outputFiles.map(async ({ path, text }) => {
    const testCode = [
      `const BUNDLED_TEST_CODE = ${JSON.stringify(text)};`,
      runnerCode,
    ];
    await fs.promises.writeFile(path, testCode.join("\n"));
  }));
}
