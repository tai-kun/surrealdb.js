import { TaskQueue } from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { test } from "@tools/test";

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

  assert.deepEqual(results.sort(), [1, 2]);
  assert.equal(queue.count, 0);
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

  await assert.rejects(
    async () => {
      setTimeout(() => controller.abort(new Error("test")), 500);
      await promise;
    },
    {
      name: "Error",
      message: "test",
    },
  );
  assert.equal(queue.count, 0);
});

test("タスクを中断する", async () => {
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

  await assert.rejects(
    async () => {
      await queue.dispose();
    },
    {
      name: "AggregateTasksError",
      message: "2 task(s) failed.",
    },
  );
  await assert.rejects(
    async () => {
      await promise1;
    },
    {
      name: "Error",
      message: "test",
    },
  );
  await assert.rejects(
    async () => {
      await promise2;
    },
    {
      name: "Error",
      message: "test",
    },
  );
  assert.equal(queue.count, 0);
});

test("インスタンスがすでに破棄されている場合は例外を投げる", async () => {
  const queue = new TaskQueue();
  const promise = queue.add(() => {});
  await queue.dispose();

  assert.equal(promise.state, "fulfilled");
  assert.equal(queue.count, 0);
  assert.equal(queue.disposed, true);
  await assert.rejects(
    async () => {
      await queue.add(() => {});
    },
    {
      name: "ResourceAlreadyDisposed",
      message: "The resource \"TaskQueue\" has been disposed.",
    },
  );
});
