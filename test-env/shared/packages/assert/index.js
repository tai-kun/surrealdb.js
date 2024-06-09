import {
  assertEquals as std_assertEquals,
  assertNotEquals as std_assertNotEquals,
} from "@std/assert";

import {
  assert,
  assertEquals as assertDeepEquals,
  assertInstanceOf,
  AssertionError,
  assertMatch,
  assertNotEquals as assertNotDeepEquals,
  assertNotInstanceOf,
  assertNotMatch,
  assertNotStrictEquals as assertNotEquals,
  assertRejects,
  assertStrictEquals as assertEquals,
  assertThrows,
  unreachable,
} from "@std/assert";

function jsonify(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertJsonEquals(actual, expected, msg) {
  std_assertEquals(jsonify(actual), jsonify(expected), msg);
}

function assertJsonNotEquals(actual, expected, msg) {
  std_assertNotEquals(jsonify(actual), jsonify(expected), msg);
}

export {
  assert,
  assertDeepEquals,
  assertEquals,
  assertInstanceOf,
  AssertionError,
  assertJsonEquals,
  assertJsonNotEquals,
  assertMatch,
  assertNotDeepEquals,
  assertNotEquals,
  assertNotInstanceOf,
  assertNotMatch,
  assertRejects,
  assertThrows,
  unreachable,
};
