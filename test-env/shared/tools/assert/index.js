import {
  assertEquals as std_assertEquals,
  assertNotEquals as std_assertNotEquals,
  assertNotStrictEquals as std_assertNotStrictEquals,
  assertStrictEquals as std_assertStrictEquals,
} from "@std/assert";

function jsonify(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertJsonEquals(actual, expected, ...args) {
  return std_assertEquals(jsonify(actual), jsonify(expected), ...args);
}

function assertJsonNotEquals(actual, expected, ...args) {
  return std_assertNotEquals(jsonify(actual), jsonify(expected), ...args);
}

function assertDeepEquals(...args) {
  return std_assertEquals(...args);
}

function assertNotDeepEquals(...args) {
  return std_assertNotEquals(...args);
}

function assertNotEquals(...args) {
  return std_assertNotStrictEquals(...args);
}

function assertEquals(...args) {
  return std_assertStrictEquals(...args);
}

export {
  assertDeepEquals,
  assertEquals,
  assertJsonEquals,
  assertJsonNotEquals,
  assertNotDeepEquals,
  assertNotEquals,
};
export {
  assert,
  assertInstanceOf,
  AssertionError,
  assertMatch,
  assertNotInstanceOf,
  assertNotMatch,
  assertRejects,
  assertThrows,
  unreachable,
} from "@std/assert";
