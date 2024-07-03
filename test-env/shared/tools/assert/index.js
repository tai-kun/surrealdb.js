const assert = require("node:assert/strict");

module.exports = Object.assign(assert, {
  jsonEqual(actual, expected, ...args) {
    return assert.deepEqual(jsonify(actual), jsonify(expected), ...args);
  },
  jsonNotEqual(actual, expected, ...args) {
    return assert.notDeepEqual(jsonify(actual), jsonify(expected), ...args);
  },
});

function jsonify(value) {
  return JSON.parse(JSON.stringify(value));
}
