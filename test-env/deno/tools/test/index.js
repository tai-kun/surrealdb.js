import * as bdd from "@std/testing/bdd";

export const ENV = "Deno";

// TODO(tai-kun): Deno でタイムアウトを自走する方法がわからないので調査する。
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
  const [name, options, fn] = args.length === 3
    ? args
    : [args[0], {}, args[1]];
  const {
    skip = false,
    timeout = 5_000,
  } = options;

  if (skip) {
    if (typeof skip === "string") {
      return bdd.it.skip(name + " # SKIP: " + skip, fn);
    } else {
      return bdd.it.skip(name + " # SKIP", fn);
    }
  } else {
    return bdd.it(name, withTimeout(fn, timeout));
  }
}

export function after(...args) {
  const [options, fn] = args.length === 2
    ? args
    : [{}, args[0]];
  const { timeout = 5_000 } = options;

  return bdd.after(withTimeout(fn, timeout));
}

export function before(...args) {
  const [options, fn] = args.length === 2
    ? args
    : [{}, args[0]];
  const { timeout = 5_000 } = options;

  return bdd.before(withTimeout(fn, timeout));
}

export function describe(...args) {
  const [name, options, fn] = args.length === 3
    ? args
    : [args[0], {}, args[1]];
  const { skip = false } = options;

  if (skip) {
    if (typeof skip === "string") {
      return bdd.describe.skip(name + " # SKIP: " + skip, fn);
    } else {
      return bdd.describe.skip(name + " # SKIP", fn);
    }
  } else {
    return bdd.describe(name, fn);
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
