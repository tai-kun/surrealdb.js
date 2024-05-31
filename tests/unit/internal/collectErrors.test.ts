"use prelude";

import { collectErrors } from "@tai-kun/surrealdb/internal";

test("should collect errors from promises", async () => {
  const errors = await collectErrors([
    Promise.resolve(1),
    Promise.reject(new Error("error")),
    undefined,
  ]);

  assertDeepEquals(errors, [new Error("error")]);
});

test("should collect errors from promises with a callback", async () => {
  const errors = await collectErrors(
    [1, 2, 3],
    value =>
      value === 2
        ? Promise.reject(new Error("error"))
        : undefined,
  );

  assertDeepEquals(errors, [new Error("error")]);
});
