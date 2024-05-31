"use prelude";

import { StatefulPromise } from "@tai-kun/surrealdb/internal";

test("should resolve a promise with `resolve`", async () => {
  const { promise, resolve } = StatefulPromise.withResolvers();

  assertEquals(promise.state, "pending");

  resolve("test");

  assertEquals(await promise, "test");
  assertEquals(promise.state, "fulfilled");
});

test("should resolve a promise with `await`", async () => {
  const promise = new StatefulPromise(resolve => resolve("test"));

  assertEquals(await promise, "test");
  assertEquals(promise.state, "fulfilled");
});

test("should reject a promise with `reject`", async () => {
  const { promise, reject } = StatefulPromise.withResolvers();

  assertEquals(promise.state, "pending");

  reject(new Error("test"));

  await assertRejects(
    async () => {
      await promise;
    },
    Error,
    "test",
  );
  assertEquals(promise.state, "rejected");
});

test("should reject a promise with `await`", async () => {
  const promise = StatefulPromise.reject(new Error("test"));

  await assertRejects(
    async () => {
      await promise;
    },
    Error,
    "test",
  );
  assertEquals(promise.state, "rejected");
});

test("should return a same value", async () => {
  const promise = new StatefulPromise(resolve => resolve({}));
  const [a, b] = await Promise.all([promise, promise]);

  assertEquals(a, b);
});
