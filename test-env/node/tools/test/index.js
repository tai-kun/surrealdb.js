// @ts-check
"use strict";

import * as node from "node:test";

/**
 * @typedef {() => void | Promise<void>} Fn
 * @typedef {{ timeout?: number | undefined }} Abortable
 * @typedef {Abortable} HookOptions
 */

/**
 * @param {[fn: Fn] | [options: HookOptions, fn: Fn]} args
 */
function parseHookArgs(args) {
  const [opts, f] = args.length === 2 ? args : [{}, args[0]];
  const { timeout = 5_000 } = opts;

  /**
   * @param {*} _ctx
   * @param {(error?: unknown) => void} done
   */
  function fn(_ctx, done) {
    (async () => {
      await f();
    })().then(done, done);
  }

  return {
    fn,
    options: {
      timeout,
    },
  };
}

export const ENV = "Node";

export { describe, test } from "node:test";

/**
 * @param  {*} args
 */
export function beforeAll(...args) {
  const {
    fn,
    options,
  } = parseHookArgs(args);

  return node.before(fn, options);
}

/**
 * @param  {*} args
 */
export function beforeEach(...args) {
  const {
    fn,
    options,
  } = parseHookArgs(args);

  return node.beforeEach(fn, options);
}

/**
 * @param  {*} args
 */
export function afterAll(...args) {
  const {
    fn,
    options,
  } = parseHookArgs(args);

  return node.after(fn, options);
}

/**
 * @param  {*} args
 */
export function afterEach(...args) {
  const {
    fn,
    options,
  } = parseHookArgs(args);

  return node.afterEach(fn, options);
}

if (typeof Promise["withResolvers"] !== "function") {
  Promise["withResolvers"] = function withResolvers() {
    let resolve, reject;
    const promise = new this((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}
