import { test as testOrigin } from "node:test";

export const ENV = "Node";

export function test(name, fn) {
  testOrigin(name, fn);
}

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