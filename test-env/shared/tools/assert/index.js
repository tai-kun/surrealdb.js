import assert from "assert";

export default Object.assign(assert.strict, {
  jsonEqual(actual, expected, ...args) {
    return assert.deepStrictEqual(
      jsonify(actual),
      jsonify(expected),
      ...args,
    );
  },
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

function jsonify(value) {
  return JSON.parse(JSON.stringify(value));
}

function match(value, regExp, message) {
  if (!(regExp instanceof RegExp)) {
    throw TypeError(
      `The value must be RegExp. Received type ${typeof value}.`,
    );
  }

  if (typeof value !== "string" || !regExp.test(value)) {
    if (message instanceof Error) {
      throw message;
    }

    const error = new assert.AssertionError({
      actual: value,
      expected: regExp,
      message: typeof message !== "string"
        ? `The "string" argument must be of type string.`
          + ` Received type ${typeof message}`
        : `The input did not match the regular expression ${regExp}.`
          + ` Input:\n\n${value}\n\n`,
      operator: "match",
      stackStartFn: match,
    });
    error.generatedMessage = !message;

    throw error;
  }
}

function doesNotMatch(value, regExp, message) {
  if (!(regExp instanceof RegExp)) {
    throw TypeError(
      `The value must be RegExp. Received type ${typeof value}.`,
    );
  }

  if (typeof value !== "string" || regExp.test(value)) {
    if (message instanceof Error) {
      throw message;
    }

    const error = new assert.AssertionError({
      actual: value,
      expected: regExp,
      message: typeof message !== "string"
        ? `The "string" argument must be of type string.`
          + ` Received type ${typeof message}`
        : `The input was expected to not match the regular expression ${regExp}.`
          + ` Input:\n\n${value}\n\n`,
      operator: "doesNotMatch",
      stackStartFn: doesNotMatch,
    });
    error.generatedMessage = !message;

    throw error;
  }
}
