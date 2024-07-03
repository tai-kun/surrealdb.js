"use strict";

import {
  afterAll as after,
  afterEach as afterEachTest,
  beforeAll as before,
  beforeEach as beforeEachTest,
  describe as desc,
  test as it,
} from "bun:test";

/**
 * @typedef {() => void | Promise<void>} Fn
 * @typedef {{ timeout?: number | undefined }} Abortable
 * @typedef {{ skip?: boolean | string | undefined }} Skipable
 * @typedef {Abortable & Skipable} TestOptions
 * @typedef {Abortable} HookOptions
 * @typedef {Skipable} SuiteOptions
 */

/**
 * @param {[name: string, fn: Fn] | [name: string, options: TestOptions, fn: Fn]} args
 */
function parseTestArgs(args) {
  const [name, opts, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  const {
    skip = false,
    timeout = 5_000,
  } = opts;

  return {
    fn,
    name,
    skip,
    timeout,
  };
}

/**
 * @param {[fn: Fn] | [options: HookOptions, fn: Fn]} args
 */
function parseHookArgs(args) {
  const [opts, f] = args.length === 2 ? args : [{}, args[0]];
  const { timeout = 5_000 } = opts;

  return {
    fn: withTimeout(f, timeout),
  };
}

/**
 * @param {[name: string, fn: () => void] | [name: string, options: SuiteOptions, fn: () => void]} args
 */
function parseDescribeArgs(args) {
  const [name, opts, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  const { skip = false } = opts;

  return {
    fn,
    name,
    skip,
  };
}

/**
 * @param {Fn} f
 * @param {number} timeout
 */
// TODO(tai-kun): Deno でタイムアウトを自走する方法がわからないので調査する。
function withTimeout(f, timeout) {
  return async function fn() {
    let timerId;

    try {
      timerId = setTimeout(() => {
        throw new Error("Timeout after " + timeout + "ms");
      }, timeout);

      return await f();
    } finally {
      clearTimeout(timerId);
    }
  };
}

export const ENV = "Bun";

export function test(...args) {
  const {
    fn,
    name,
    skip,
    timeout,
  } = parseTestArgs(args);

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

export function beforeAll(...args) {
  const {
    fn,
  } = parseHookArgs(args);

  return before(fn);
}

export function beforeEach(...args) {
  const {
    fn,
  } = parseHookArgs(args);

  return beforeEachTest(fn);
}

export function afterAll(...args) {
  const {
    fn,
  } = parseHookArgs(args);

  return after(fn);
}

export function afterEach(...args) {
  const {
    fn,
  } = parseHookArgs(args);

  return afterEachTest(fn);
}

export function describe(...args) {
  const {
    fn,
    name,
    skip,
  } = parseDescribeArgs(args);

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
