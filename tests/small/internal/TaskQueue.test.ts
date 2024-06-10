import {
  assertDeepEquals,
  assertEquals,
  assertMatch,
  assertRejects,
} from "@pkg/assert";
import { ENV, test } from "@pkg/test";
import { TaskQueue } from "@tai-kun/surrealdb/_internal";
import { ResourceAlreadyDisposed } from "@tai-kun/surrealdb/errors";

test("タスクランナーをキューに追加する", async () => {
  const queue = new TaskQueue();
  const results: number[] = [];
  const promise1 = queue.add(async () => {
    results.push(1);
  });
  const promise2 = queue.add(async () => {
    results.push(2);
  });
  await Promise.all([promise1, promise2]);

  assertDeepEquals(results.sort(), [1, 2]);
  assertEquals(queue.count, 0);
});

test("タスクを中断して拒否する", async () => {
  const queue = new TaskQueue();
  const controller = new AbortController();
  const promise = queue.add(
    ({ signal }) => {
      return new Promise((_, reject) => {
        signal.addEventListener("abort", () => {
          reject(signal.reason);
        });
      });
    },
    {
      signal: controller.signal,
    },
  );

  await assertRejects(
    async () => {
      setTimeout(() => controller.abort(new Error("test")), 500);
      await promise;
    },
    Error,
    "test",
  );
  assertEquals(queue.count, 0);
});

test("タスクを中断する", async () => {
  if (ENV === "Firefox") {
    // TODO(tai-kun): Firefox でテストに失敗する。要調査。
    return;
  }

  const queue = new TaskQueue();
  const promise1 = queue.add(({ signal }) => {
    return new Promise((_, reject) => {
      signal.addEventListener("abort", () => {
        reject(signal.reason);
      });
    });
  });
  const promise2 = queue.add(({ signal }) => {
    return new Promise((_, reject) => {
      signal.addEventListener("abort", () => {
        reject(signal.reason);
      });
    });
  });

  queue.abort(new Error("test"));
  const result = await queue.dispose();

  assertEquals(result.ok, false);
  assertMatch(
    // @ts-expect-error
    result.error.stack,
    /AggregateTasksError: 2 task\(s\) failed\./,
  );
  await assertRejects(
    async () => {
      await promise1;
    },
    Error,
    "test",
  );
  await assertRejects(
    async () => {
      await promise2;
    },
    Error,
    "test",
  );
  assertEquals(queue.count, 0);
});

test("インスタンスがすでに破棄されている場合は例外を投げる", async () => {
  const queue = new TaskQueue();
  const promise = queue.add(() => {});
  await queue.dispose();

  assertEquals(promise.state, "fulfilled");
  assertEquals(queue.count, 0);
  assertEquals(queue.disposed, true);
  await assertRejects(
    async () => {
      await queue.add(() => {});
    },
    ResourceAlreadyDisposed,
    "The resource \"TaskQueue\" has been disposed.",
  );
});
