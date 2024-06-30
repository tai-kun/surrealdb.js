import { err, ok } from "@tai-kun/surreal/_internal";
import { assertDeepEquals } from "@tools/assert";
import { test } from "@tools/test";

test("値無しで Ok を作成する", () => {
  const result = ok();

  assertDeepEquals(result, {
    ok: true,
  });
});

test("値付きで Ok を作成する", () => {
  const result = ok(1);

  assertDeepEquals(result, {
    ok: true,
    value: 1,
  });
});

test("メタデータ付きで Ok を作成する", () => {
  const result = ok(1, { meta: true });

  assertDeepEquals(result, {
    ok: true,
    value: 1,
    meta: true,
  });
});

test("Ok の ok プロパティを上書きできない", () => {
  const result = ok(1, { ok: false });

  assertDeepEquals(result, {
    ok: true,
    value: 1,
  });
});

test("エラー無しで Err を作成する", () => {
  const result = err();

  assertDeepEquals(result, {
    ok: false,
  });
});

test("エラー付きで Err を作成する", () => {
  const error = new Error("error");
  const result = err(error);

  assertDeepEquals(result, {
    ok: false,
    error,
  });
});

test("メタデータ付きで Err を作成する", () => {
  const error = new Error("error");
  const result = err(error, { meta: true });

  assertDeepEquals(result, {
    ok: false,
    error,
    meta: true,
  });
});

test("Err の ok プロパティを上書きできない", () => {
  const error = new Error("error");
  const result = err(error, { ok: true });

  assertDeepEquals(result, {
    ok: false,
    error,
  });
});
