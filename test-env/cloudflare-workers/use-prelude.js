import "./assert.js";
import { test } from "vitest";

Object.assign(globalThis, {
  TEST_ENV: "CloudflareWorkers",
  test,
});
