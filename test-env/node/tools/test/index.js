import { after as afterAll, before as beforeAll } from "node:test";

export const ENV = "Node";

export { describe, test } from "node:test";

export function after(...args) {
  const [options, fn] = args.length === 2 ? args : [{}, args[0]];

  return afterAll(fn, options);
}

export function before(...args) {
  const [options, fn] = args.length === 2 ? args : [{}, args[0]];

  return beforeAll(fn, options);
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
