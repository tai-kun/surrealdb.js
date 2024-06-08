/**
 * This script is a test runner that executes bundled test code in the browser.
 */

import { basename, relative } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Browser, Builder } from "selenium-webdriver";

const envName = basename(process.cwd());
const browser = {
  chrome: Browser.CHROME,
}[envName];

if (!browser) {
  throw new Error(`Unsupported browser: ${envName}`);
}

const d = await new Builder()
  .forBrowser(browser)
  .usingServer("http://localhost:4444/wd/hub")
  .build();

const serializeError = `(function serializeError(error) {
  if (error instanceof Error) {
    const errorObject = {
      name: error.name,
      message: error.message,
    };

    if (typeof error.stack === "string") {
      errorObject.stack = error.stack;
    }

    for (const [key, value] of Object.entries(error)) {
      if (["name", "message", "stack"].includes(key)) {
        continue;
      }

      errorObject[key] = value;
    }

    return errorObject;
  }

  try {
    return JSON.parse(JSON.stringify(error));
  } catch {
    return String(error);
  }
})`;

function deserializeError(error) {
  if (
    typeof error === "object"
    && error !== null
    && typeof error.name === "string"
    && typeof error.message === "string"
  ) {
    const e = new Error(error.message);
    e.name = error.name;
    e.stack = error.stack;

    for (const [key, value] of Object.entries(error)) {
      if (["name", "message", "stack"].includes(key)) {
        continue;
      }

      e[key] = value;
    }

    return e;
  } else {
    return new Error("Failed test", { cause: error });
  }
}

if ("SURREALDB" in globalThis) {
  await SURREALDB.ready;
}

const runTest = `(async () => {
  const __testQueue = [];
  ${
  "SURREALDB" in globalThis
    ? `globalThis.SURREALDB = {
        ready: Promise.resolve(),
        host: "${SURREALDB.host}",
      };`
    : ""
}
  await (async () => { ${BUNDLED_TEST_CODE} })();
  const results = [];

  for (const { name, fn } of __testQueue) {
    try {
      await fn();
      results.push({
        name,
        status: "passed",
      });
    } catch (error) {
      results.push({
        name,
        status: "failed",
        error: ${serializeError}(error),
      });
    }
  }

  return results;
})`;

try {
  /** @type {{ success: true; results: ({ name: string; status: "passed" } | { name: string; status: "failed"; error: unknown })[] } | { success: false; error: unknown }} */
  const scriptResult = await d.executeAsyncScript(`  
  ${runTest}().then(
    results => arguments[arguments.length - 1]({
      success: true,
      results,
    }),
    error => arguments[arguments.length - 1]({
      success: false,
      error: ${serializeError}(error),
    }),
  );
  `);

  const rootdir = process.cwd();
  const filename = fileURLToPath(import.meta.url);
  const testfile = relative(rootdir, filename);

  describe(testfile, () => {
    if (!scriptResult.success) {
      throw Error("Failed to run the test script", {
        cause: scriptResult.error,
      });
    }

    for (const testResult of scriptResult.results) {
      if (testResult.status === "passed") {
        test(testResult.name, { timeout: 60e3 }, () => {});
      } else {
        test(testResult.name, { timeout: 60e3 }, () => {
          throw deserializeError(testResult.error);
        });
      }
    }
  });
} finally {
  await d.quit();
}
