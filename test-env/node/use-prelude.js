import "./assert.js";
import { test } from "node:test";

Object.assign(globalThis, {
  TEST_ENV: "Node",
  test(name, fn) {
    test(name, { timeout: 60e3 }, fn);
  },
});

if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function withResolvers() {
    let resolve, reject;
    const promise = new this((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}
