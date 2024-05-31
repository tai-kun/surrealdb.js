"use prelude";

import { runInAsync } from "@tai-kun/surrealdb/internal";

test("should run async function in async context", async () => {
  async function fn(a: number, b: number): Promise<number> {
    return a + b;
  }

  const result = await runInAsync(fn, 1, 2);

  assertEquals(result, 3);
});

test("should run sync function in async context", async () => {
  function fn(a: number, b: number): number {
    return a + b;
  }

  const result = await runInAsync(fn, 1, 2);

  assertEquals(result, 3);
});

test("should reject if async function rejects", async () => {
  async function fn(): Promise<void> {
    throw new Error("test");
  }

  await assertRejects(
    () => {
      const promise = runInAsync(fn);
      return promise;
    },
    Error,
    "test",
  );
});

test("assertRejects should fail if the function throws an error synchronously", async () => {
  function fn(): Promise<void> {
    throw new Error("test");
  }

  await assertRejects(
    async () => {
      // should fail
      await assertRejects(() => {
        const promise = fn(); // throws synchronously here
        return promise;
      });
    },
    AssertionError,
  );
});

test("should reject if sync function throws", async () => {
  function fn(): void {
    throw new Error("test");
  }

  // Even if an error is thrown synchronously,
  // it will be handled as if the error was thrown by an asynchronous function.
  await assertRejects(
    () => {
      const promise = runInAsync(fn);
      return promise;
    },
    Error,
    "test",
  );
});
