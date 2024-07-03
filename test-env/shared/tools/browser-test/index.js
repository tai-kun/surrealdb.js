// @ts-check
"use strict";

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
  const [name, opts, f] = args.length === 3 ? args : [args[0], {}, args[1]];
  const {
    skip = false,
    timeout = 5_000,
  } = opts;

  return {
    fn: withTimeout(f, timeout),
    name,
    skip,
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
function withTimeout(f, timeout) {
  /**
   * @this {*}
   * @param {(error?: unknown) => void} done
   */
  return function fn(done) {
    this.timeout(timeout);
    (async () => {
      await f();
    })().then(done, done);
  };
}

/**
 * @param {*} args
 */
export function test(...args) {
  const {
    fn,
    name,
    skip,
  } = parseTestArgs(args);

  if (skip) {
    if (typeof skip === "string") {
      return globalThis.it.skip(name + " # SKIP: " + skip, fn);
    } else {
      return globalThis.it.skip(name + " # SKIP", fn);
    }
  } else {
    return globalThis.it(name, fn);
  }
}

/**
 * @param {*} args
 */
export function beforeAll(...args) {
  const {
    fn,
  } = parseHookArgs(args);

  return globalThis.before(fn);
}

/**
 * @param {*} args
 */
export function beforeEach(...args) {
  const {
    fn,
  } = parseHookArgs(args);

  return globalThis.beforeEach(fn);
}

/**
 * @param {*} args
 */
export function afterAll(...args) {
  const {
    fn,
  } = parseHookArgs(args);

  return globalThis.after(fn);
}

/**
 * @param {*} args
 */
export function afterEach(...args) {
  const {
    fn,
  } = parseHookArgs(args);

  return globalThis.afterEach(fn);
}

/**
 * @param {*} args
 */
export function describe(...args) {
  const {
    fn,
    name,
    skip,
  } = parseDescribeArgs(args);

  if (skip) {
    if (typeof skip === "string") {
      return globalThis.describe.skip(name + " # SKIP: " + skip, fn);
    } else {
      return globalThis.describe.skip(name + " # SKIP", fn);
    }
  } else {
    return globalThis.describe(name, fn);
  }
}
