import { build } from "esbuild";
import { glob } from "glob";
import path from "node:path";

const [, , target, size] = process.argv;

if (!target || !size) {
  throw new Error("Please specify a target and size");
}

const entryPoints = await glob(`tests/${size}/**/*.ts`, { ignore: ["*.d.ts"] });
await build({
  bundle: false,
  entryPoints,
  format: "esm",
  outbase: "tests",
  outdir: path.join(target, "tests"),
  platform: "browser",
  target: "es2020",
  write: true,
  sourcemap: "inline",
  packages: "external",
});
