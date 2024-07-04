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
  // 実装されているのになぜか match と doesNotMatch が見つからないので追加。
  match,
  doesNotMatch,
});

/**
 * @param {*} value
 * @returns {*}
 */
function jsonify(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * @param {string} value
 * @param {RegExp} regExp
 * @param {string | Error} [message]
 */
function match(value, regExp, message) {
  innerMatch(value, regExp, message, "match", match);
}

/**
 * @param {string} value
 * @param {RegExp} regExp
 * @param {string | Error} [message]
 */
function doesNotMatch(value, regExp, message) {
  innerMatch(value, regExp, message, "doesNotMatch", doesNotMatch);
}

/**
 * @param {string} value
 * @param {RegExp} regExp
 * @param {string | Error | undefined} message
 * @param {string} operator
 * @param {Function} stackStartFn
 */
function innerMatch(value, regExp, message, operator, stackStartFn) {
  if (!(regExp instanceof RegExp)) {
    throw TypeError(
      `The "regExp" argument must be RegExp. `
        + `Received type ${typeof regExp}.`,
    );
  }

  if (
    typeof value !== "string"
    || regExp.test(value) === (operator === "match")
  ) {
    if (message instanceof Error) {
      throw message;
    }

    const error = new assert.AssertionError({
      actual: value,
      expected: regExp,
      message: !message
        ? typeof value !== "string"
          ? `The "value" argument must be of type string. `
            + `Received type ${typeof value}`
          : `The input did not match the regular expression ${regExp}. `
            + `Input:\n\n${value}\n\n`
        : message,
      operator,
      stackStartFn,
    });
    error.generatedMessage = !message;

    throw error;
  }
}
