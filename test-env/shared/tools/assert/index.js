// @ts-check
"use strict";

import { strict } from "assert";

export default Object.assign(strict, {
  /**
   * @param {unknown} actual
   * @param {import("type-fest").Jsonifiable} expected
   * @param {string | Error | undefined} [message]
   */
  jsonEqual(actual, expected, message) {
    strict.equal(
      JSON.stringify(actual),
      JSON.stringify(expected),
      message,
    );
  },
  /**
   * @param {unknown} actual
   * @param {unknown} expected
   * @param {string | Error | undefined} [message]
   */
  notJsonEqual(actual, expected, message) {
    strict.notEqual(
      JSON.stringify(actual),
      JSON.stringify(expected),
      message,
    );
  },
  /**
   * @param {unknown} actual
   * @param {import("type-fest").Jsonifiable} expected
   * @param {string | Error | undefined} [message]
   */
  deepJsonEqual(actual, expected, message) {
    strict.deepEqual(
      JSON.parse(JSON.stringify(actual)),
      JSON.parse(JSON.stringify(expected)),
      message,
    );
  },
  /**
   * @param {unknown} actual
   * @param {unknown} expected
   * @param {string | Error | undefined} [message]
   */
  notDeepJsonEqual(actual, expected, message) {
    strict.notDeepEqual(
      JSON.parse(JSON.stringify(actual)),
      JSON.parse(JSON.stringify(expected)),
      message,
    );
  },
});
