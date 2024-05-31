import "./assert.js";
import { test } from "bun:test";

Object.assign(globalThis, {
  TEST_ENV: "Bun",
  test,
});
