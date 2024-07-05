import { build } from "esbuild";
import { polyfillNode } from "esbuild-plugin-polyfill-node";
import path from "node:path";

const indexJs = path.resolve("index.js");

build({
  allowOverwrite: true,
  entryPoints: [indexJs],
  outfile: indexJs,
  bundle: true,
  format: "esm",
  platform: "browser",
  sourcemap: "inline",
  plugins: [
    polyfillNode({
      globals: {
        buffer: true,
        global: true,
        process: true,
        navigator: true,
        __dirname: false,
        __filename: false,
      },
      polyfills: {
        assert: false,
        "assert/strict": false,
      },
    }),
  ],
});
