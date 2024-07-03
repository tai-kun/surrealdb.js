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
});

function jsonify(value) {
  return JSON.parse(JSON.stringify(value));
}
