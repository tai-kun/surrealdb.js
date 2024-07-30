import { TaskQueue } from "@tai-kun/surrealdb/utils";
import { describe, expect, test, vi } from "vitest";

test("タスクランナーをキューに追加する", async () => {
  const results: number[] = [];
  const q = new TaskQueue();
  const p1 = q.add(() => {
    results.push(1);
  });
  const p2 = q.add(async () => {
    results.push(2);
  });
  await Promise.all([p1, p2]);

  expect(results).toStrictEqual([1, 2]);
  expect(q.count).toBe(0);
});

test("特定のタスクを中断する", async () => {
  const q = new TaskQueue();
  const c = new AbortController();
  const p = q.add(
    ({ signal }) =>
      new Promise((_, reject) => {
        signal.addEventListener("abort", function() {
          reject(this.reason);
        });
      }),
    { signal: c.signal },
  );
  c.abort(new Error("test"));

  await expect(async () => await p)
    .rejects
    .toThrowError("test");
  expect(q.count).toBe(0);
});

test("キュー内の全タスクを中断する", async () => {
  const q = new TaskQueue();
  const p1 = q.add(({ signal }) =>
    new Promise((_, reject) => {
      signal.addEventListener("abort", function() {
        reject(this.reason);
      });
    })
  );
  const p2 = q.add(({ signal }) =>
    new Promise((_, reject) => {
      signal.addEventListener("abort", function() {
        reject(this.reason);
      });
    })
  );

  expect(q.count).toBe(2);

  q.abort(new Error("test"));

  await expect(async () => await p1)
    .rejects
    .toThrowError("test");
  await expect(async () => await p2)
    .rejects
    .toThrowError("test");
  expect(q.count).toBe(0);
});

describe("ドキュメントの例", () => {
  test("すべてのタスクランナーが終了するまで待つ", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      const queue = new TaskQueue();
      const results: string[] = [];
      queue.add(async () => {
        results.push("Hello");
      });
      queue.add(() => {
        throw null;
      });

      console.log(queue.count);

      await queue.idle();

      console.log(queue.count);
      console.log(results);

      // Test
      {
        await vi.waitUntil(() => spy.mock.calls.length === 3);
        expect(spy.mock.calls).toStrictEqual([
          [2],
          [0],
          [["Hello"]],
        ]);
      }
    } finally {
      // Clean up

      spy.mockClear();
    }
  });
});
