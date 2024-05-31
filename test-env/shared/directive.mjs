/**
 * This script resolves custom directives within the test code.
 */

import * as glob from "glob";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import * as process from "node:process";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    env: {
      type: "string",
    },
  },
});
const usePrelude = resolve("use-prelude.js");
const useSurrealDb = resolve("use-surrealdb.js");
await Promise.all(
  glob.sync("tests/**/*.ts").map(async file => {
    let match,
      content = await readFile(file = resolve(file), "utf8"),
      original = content;

    while ((match = content.match(/^"use\s+(.+)";$/m))) {
      const [line, directive] = match;
      const replace = value => {
        const { index } = match;
        content = content.slice(0, index)
          + value
          + content.slice(index + line.length);
      };

      switch (directive) {
        case "prelude":
          replace(`import "${relative(dirname(file), usePrelude)}";`);

          break;

        case "surrealdb":
          if (values.env === "browser") {
            replace("globalThis.__USE_SURREALDB__ = true;");
          } else {
            replace(`import "${relative(dirname(file), useSurrealDb)}";`);
          }

          break;
      }
    }

    if (content !== original) {
      await writeFile(file, content);
    }
  }),
);
