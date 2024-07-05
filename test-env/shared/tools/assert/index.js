// @ts-check
"use strict";

import assert from "assert";

export default Object.assign(assert.strict, {
  /**
   * @param {unknown} actual
   * @param {import("type-fest").Jsonifiable} expected
   * @param {string | Error | undefined} [message]
   */
  jsonEqual(actual, expected, message) {
    assert.strict.equal(
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
    assert.strict.notEqual(
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
    assert.strict.deepEqual(
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
    assert.strict.notDeepEqual(
      JSON.parse(JSON.stringify(actual)),
      JSON.parse(JSON.stringify(expected)),
      message,
    );
  },
});
