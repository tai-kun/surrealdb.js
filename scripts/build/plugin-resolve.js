import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {{ esm: boolean }} options
 * @returns {import("esbuild").Plugin}
 */
export function resolve(options) {
  /** @type {Record<string, boolean>} */
  const accessCache = {};

  /**
   * @param {string} file
   * @returns {boolean}
   */
  function isExist(file) {
    if (file in accessCache) {
      return /** @type {boolean} */ (accessCache[file]);
    }

    try {
      fs.accessSync(file, fs.constants.R_OK);

      return (accessCache[file] = fs.statSync(file).isFile());
    } catch {
      return (accessCache[file] = false);
    }
  }

  /** @type {Record<string, string | null>} */
  const builtPathCache = {};

  /**
   * @param {[string, string][]} resolvers
   * @returns {(resolveDir: string, file: string) => string | null}
   */
  function createGetBuiltPath(resolvers) {
    return function getBuiltPath(resolveDir, file) {
      const filepath = path.join(resolveDir, file);

      if (filepath in builtPathCache) {
        return /** @type {string | null} */ (builtPathCache[filepath]);
      }

      for (const [src, dst] of resolvers) {
        if (isExist(filepath + src)) {
          return (builtPathCache[filepath] = filepath + dst);
        }
      }

      return (builtPathCache[filepath] = null);
    };
  }

  /**
   * @param {string} resolveDir
   * @param {string} file
   * @returns {string}
   */
  function toOutFilePath(resolveDir, file) {
    file = path.normalize(path.relative(resolveDir + path.sep, file));

    if (!file.startsWith(".")) {
      file = `.${path.sep}${file}`;
    }

    return file;
  }

  return {
    name: "resolve",
    setup(build) {
      if (build.initialOptions.bundle !== true) {
        throw new Error(
          "resolve plugin requires the bundle option to be set to true",
        );
      }

      const defaultExt = options.esm ? ".mjs" : ".cjs";
      const resolvers = Object.entries({
        "": "",
        ".ts": defaultExt,
        "/index.ts": `/index${defaultExt}`,
        ".js": defaultExt,
        "/index.js": `/index${defaultExt}`,
      });
      const getBuiltPath = createGetBuiltPath(resolvers);
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const rootDir = path.join(__dirname, "..", "..");
      const { compilerOptions: { paths } } = JSON.parse(
        fs.readFileSync(path.join(rootDir, "tsconfig.json"), "utf8"),
      );

      build.onResolve({ filter: /.*/ }, async args => {
        const { namespace, kind, path: pkg, resolveDir } = args;

        switch (true) {
          case namespace !== "file" || kind !== "import-statement":
            return null;

          case pkg.startsWith("@tai-kun/surrealdb/"): {
            const filepath = paths[pkg][0].replace(/\.ts$/, "");
            const builtPath = getBuiltPath(rootDir, filepath);

            if (builtPath) {
              return {
                path: toOutFilePath(resolveDir, builtPath),
                external: true,
              };
            }

            return {
              errors: [
                {
                  text: `Cannot resolve "${pkg}"`,
                },
              ],
            };
          }

          case pkg.startsWith("."): {
            const builtPath = getBuiltPath(resolveDir, pkg);

            if (builtPath) {
              return {
                path: toOutFilePath(resolveDir, builtPath),
                external: true,
              };
            }

            return {
              errors: [
                {
                  text: `Cannot resolve "${pkg}"`,
                },
              ],
            };
          }

          default:
            return {
              external: true,
            };
        }
      });
    },
  };
}
