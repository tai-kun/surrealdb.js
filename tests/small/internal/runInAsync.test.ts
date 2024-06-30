import { assertEquals, AssertionError, assertRejects } from "@tools/assert";
import { test } from "@tools/test";
import { runInAsync } from "surreal-js/_internal";

test("非同期コンテキストで非同期関数を実行する", async () => {
  async function fn(a: number, b: number): Promise<number> {
    return a + b;
  }

  const result = await runInAsync(fn, 1, 2);

  assertEquals(result, 3);
});

test("非同期コンテキストで同期関数を実行する", async () => {
  function fn(a: number, b: number): number {
    return a + b;
  }

  const result = await runInAsync(fn, 1, 2);

  assertEquals(result, 3);
});

test("非同期関数が拒否されると拒否する", async () => {
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

test("runInAsync 無しで同期的に例外を投げると assertRejects が失敗する", async () => {
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

test("runInAsync 有りで同期的に例外を投げると assertRejects が成功する", async () => {
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
