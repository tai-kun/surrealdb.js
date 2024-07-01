import { test as it } from "bun:test";

export const ENV = "Bun";

export function test(...args) {
  const [name, options, fn] = args.length === 3
    ? args
    : [args[0], {}, args[1]];
  const { skip = false, timeout = 5_000 } = options;

  if (skip) {
    if (typeof skip === "string") {
      return it.skip(name + "  # Skip: " + skip, fn);
    } else {
      return it.skip(name + "  # Skip", fn);
    }
  } else {
    return it(name, fn, timeout);
  }
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
