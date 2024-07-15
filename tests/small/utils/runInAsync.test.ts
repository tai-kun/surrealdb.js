import { runInAsync } from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("非同期コンテキストで非同期関数を実行する", async () => {
  async function fn(a: number, b: number): Promise<number> {
    return a + b;
  }

  const result = await runInAsync(fn, 1, 2);

  assert.equal(result, 3);
});

test("非同期コンテキストで同期関数を実行する", async () => {
  function fn(a: number, b: number): number {
    return a + b;
  }

  const result = await runInAsync(fn, 1, 2);

  assert.equal(result, 3);
});

test("非同期関数が拒否されると拒否する", async () => {
  async function fn(): Promise<void> {
    throw new Error("test");
  }

  await assert.rejects(
    () => {
      const promise = runInAsync(fn);
      return promise;
    },
    {
      name: "Error",
      message: "test",
    },
  );
});

test("runInAsync 無しで同期的に例外を投げると assert.rejects が失敗する", async () => {
  function fn(): Promise<void> {
    throw new Error("test");
  }

  await assert.rejects(
    async () => {
      // この assert.rejects は失敗します。
      await assert.rejects(() => {
        const promise = fn(); // ここで同期的にエラーを投げます。
        return promise;
      });
    },
    {
      name: "Error",
      message: "test",
    },
  );
});

test("runInAsync 有りで同期的に例外を投げると assert.rejects が成功する", async () => {
  function fn(): void {
    throw new Error("test");
  }

  // 同期的にエラーが投げられた場合でも、非同期関数によって投げられたかのように処理されます。
  await assert.rejects(
    () => {
      const promise = runInAsync(fn);
      return promise;
    },
    {
      name: "Error",
      message: "test",
    },
  );
});
