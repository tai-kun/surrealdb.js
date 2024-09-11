import { build } from "esbuild";
import { replace } from "esbuild-plugin-replace";
import { glob } from "glob";
import { resolve } from "./plugin-resolve.js";

const entryPoints = await glob("src/*/**/*.ts");
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
    target: "safari15",
    write: true,
    sourcemap: "inline",
    plugins: [
      resolve({ esm: format === "esm" }),
      replace({
        __DEV__: "/* __TAI_KUN__SURREALDB__DIAGNOSTICS_CHANNEL__ */ false",
      }),
    ],
    packages: "external",
    keepNames: true,
  });
}));
