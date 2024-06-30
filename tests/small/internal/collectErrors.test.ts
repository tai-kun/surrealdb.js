import { assertDeepEquals } from "@tools/assert";
import { test } from "@tools/test";
import { collectErrors } from "surreal-js/_internal";

test("Promise のエラーを収集する", async () => {
  const error = new Error("error");
  const errors = await collectErrors([
    Promise.resolve(1),
    Promise.reject(error),
    undefined,
  ]);

  assertDeepEquals(errors, [error]);
});

test("Promise をコールバックで取り出しながらエラーを収集する", async () => {
  const error = new Error("error");
  const errors = await collectErrors(
    [1, 2, 3],
    value =>
      value === 2
        ? Promise.reject(error)
        : undefined,
  );

  assertDeepEquals(errors, [error]);
});
