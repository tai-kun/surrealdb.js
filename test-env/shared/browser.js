/**
 * This script is a test runner that executes bundled test code in the browser.
 */

import { SeleniumContainer } from "@testcontainers/selenium";
import { relative } from "node:path";
import process from "node:process";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Browser, Builder } from "selenium-webdriver";

const { SELENIUM_DOCKER_IMAGE, SELENIUM_DOCKER_IMAGE_TAG } = process.env;
const DOCKER_IMAGE = `${SELENIUM_DOCKER_IMAGE}:${SELENIUM_DOCKER_IMAGE_TAG}`;

let c = new SeleniumContainer(DOCKER_IMAGE);

if ("SURREALDB" in globalThis) {
  c = c.withNetwork(SURREALDB.DOCKER_NETWORK);
}

c = await c.start();

const d = await new Builder()
  .forBrowser(
    SELENIUM_DOCKER_IMAGE.includes("chrome")
      ? Browser.CHROME
      : Browser.FIREFOX,
  )
  .usingServer(c.getServerUrl())
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

const runTest = `(async () => {
  const __testQueue = [];
  ${
  "SURREALDB" in globalThis
    ? `globalThis.SURREALDB_HOST = "${SURREALDB.CONTAINER_NAME}:${SURREALDB.PORT_NUMBER}";`
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

  if (!scriptResult.success) {
    throw Error("Failed to run the test script", {
      cause: scriptResult.error,
    });
  }

  const rootdir = process.cwd();
  const filename = fileURLToPath(import.meta.url);
  const testfile = relative(rootdir, filename);

  describe(testfile, () => {
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
