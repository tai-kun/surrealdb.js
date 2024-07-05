// @ts-check
"use strict";

import assert from "assert";

export default Object.assign(assert.strict, {
  /**
   * @param {*} actual
   * @param {*} expected
   * @param  {*} args
   * @returns {*}
   */
  jsonEqual(actual, expected, ...args) {
    return assert.deepStrictEqual(
      jsonify(actual),
      jsonify(expected),
      ...args,
    );
  },
  /**
   * @param {*} actual
   * @param {*} expected
   * @param  {*} args
   * @returns {*}
   */
  jsonNotEqual(actual, expected, ...args) {
    return assert.notDeepStrictEqual(
      jsonify(actual),
      jsonify(expected),
      ...args,
    );
  },
});

/**
 * @param {*} value
 * @returns {*}
 */
function jsonify(value) {
  return JSON.parse(JSON.stringify(value));
}
