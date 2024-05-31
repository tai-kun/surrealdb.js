"use prelude";

import { err, ok } from "@tai-kun/surrealdb/internal";

test("should create an Ok result with no value", () => {
  const result = ok();

  assertDeepEquals(result, {
    ok: true,
  });
});

test("should create an Ok result with a value", () => {
  const result = ok(1);

  assertDeepEquals(result, {
    ok: true,
    value: 1,
  });
});

test("should create an Ok result with metadata", () => {
  const result = ok(1, { meta: true });

  assertDeepEquals(result, {
    ok: true,
    value: 1,
    meta: true,
  });
});

test("should not override the ok property", () => {
  const result = ok(1, { ok: false });

  assertDeepEquals(result, {
    ok: true,
    value: 1,
  });
});

test("should create an Err result with no error", () => {
  const result = err();

  assertDeepEquals(result, {
    ok: false,
  });
});

test("should create an Err result with an error", () => {
  const result = err(new Error("error"));

  assertDeepEquals(result, {
    ok: false,
    error: new Error("error"),
  });
});

test("should create an Err result with metadata", () => {
  const result = err(new Error("error"), { meta: true });

  assertDeepEquals(result, {
    ok: false,
    error: new Error("error"),
    meta: true,
  });
});

test("should not override the ok property", () => {
  const result = err(new Error("error"), { ok: true });

  assertDeepEquals(result, {
    ok: false,
    error: new Error("error"),
  });
});
