import { build } from "esbuild";
import { glob } from "glob";
import { resolve } from "./resolve.mjs";

const entryPoints = await glob("src/**/*.ts", { ignore: ["src/**/*.d.ts"] });

await Promise.all(["esm", "cjs"].map(async format => {
  await build({
    bundle: true,
    entryPoints,
    format: format === "esm" ? "esm" : "cjs",
    outExtension: {
      ".js": format === "esm" ? ".mjs" : ".cjs",
    },
    outbase: "src",
    outdir: "dist",
    platform: "browser",
    target: "es2020",
    write: true,
    lineLimit: 80,
    sourcemap: "inline",
    plugins: [
      resolve({ esm: format === "esm" }),
    ],
  });
}));
