import "./assert.js";
import { test } from "node:test";

Object.assign(globalThis, {
  TEST_ENV: "Node",
  test(name, fn) {
    test(name, { timeout: 60e3 }, fn);
  },
});
