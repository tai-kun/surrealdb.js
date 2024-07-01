import { afterAll, beforeAll, describe as desc, test as it } from "bun:test";

export const ENV = "Bun";

function withTimeout(fn, timeout) {
  return async () => {
    let timerId;

    try {
      timerId = setTimeout(() => {
        throw new Error("Timeout after " + timeout + "ms");
      }, timeout);

      return await fn();
    } finally {
      clearTimeout(timerId);
    }
  };
}

export function test(...args) {
  const [name, options, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  const {
    skip = false,
    timeout = 5_000,
  } = options;

  if (skip) {
    if (typeof skip === "string") {
      return it.skip(name + " # SKIP: " + skip, fn);
    } else {
      return it.skip(name + " # SKIP", fn);
    }
  } else {
    return it(name, fn, timeout);
  }
}

export function after(...args) {
  const [options, fn] = args.length === 2 ? args : [{}, args[0]];
  const { timeout = 5_000 } = options;

  return afterAll(withTimeout(fn, timeout));
}

export function before(...args) {
  const [options, fn] = args.length === 2 ? args : [{}, args[0]];
  const { timeout = 5_000 } = options;

  return afterAll(withTimeout(fn, timeout));
}

export function describe(...args) {
  const [name, options, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  const { skip = false } = options;

  if (skip) {
    if (typeof skip === "string") {
      return desc.skip(name + " # SKIP: " + skip, fn);
    } else {
      return desc.skip(name + " # SKIP", fn);
    }
  } else {
    return desc(name, fn);
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
