"use prelude";

import { ResourceDisposed } from "@tai-kun/surrealdb";
import { Tasks } from "@tai-kun/surrealdb/internal";

test("should stack and run tasks", async () => {
  const tasks = new Tasks();
  const results: number[] = [];
  const promise1 = tasks.add(async () => {
    results.push(1);
  });
  const promise2 = tasks.add(async () => {
    results.push(2);
  });
  await Promise.all([promise1, promise2]);

  assertDeepEquals(results.sort(), [1, 2]);
  assertEquals(tasks.count, 0);
});

test("should abort a task and reject", async () => {
  const tasks = new Tasks();
  const ac = new AbortController();
  const promise = tasks.add(
    ({ signal }) => {
      return new Promise((_, reject) => {
        signal.addEventListener("abort", () => {
          reject(signal.reason);
        });
      });
    },
    {
      signal: ac.signal,
    },
  );

  await assertRejects(
    async () => {
      setTimeout(
        () => {
          ac.abort(new Error("test"));
        },
        1_000,
      );
      await promise;
    },
    Error,
    "test",
  );
  assertEquals(tasks.count, 0);
});

test("should abort tasks", async () => {
  const tasks = new Tasks();
  const promise1 = tasks.add(({ signal }) => {
    return new Promise((_, reject) => {
      signal.addEventListener("abort", () => {
        reject(signal.reason);
      });
    });
  });
  const promise2 = tasks.add(({ signal }) => {
    return new Promise((_, reject) => {
      signal.addEventListener("abort", () => {
        reject(signal.reason);
      });
    });
  });

  tasks.abort(new Error("test"));
  const result = await tasks.dispose();

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
  assertEquals(tasks.count, 0);
});

test("should reject if the tasks has been disposed", async () => {
  const tasks = new Tasks();
  const promise = tasks.add(() => {});
  await tasks.dispose();

  assertEquals(promise.state, "fulfilled");
  assertEquals(tasks.count, 0);
  assertEquals(tasks.disposed, true);
  await assertRejects(
    async () => {
      await tasks.add(() => {});
    },
    ResourceDisposed,
    "The resource \"Tasks\" has been disposed.",
  );
});

test("should reject if the task has been aborted", async () => {
  const tasks = new Tasks();
  const ac = new AbortController();
  ac.abort();
  const promise = tasks.add(
    ({ signal }) => {
      return new Promise(
        (_, reject) => {
          signal.addEventListener("abort", () => {
            reject(signal.reason);
          });
        },
      );
    },
    {
      signal: ac.signal,
    },
  );

  await assertRejects(
    async () => {
      await promise;
    },
    Error,
    " aborted",
  );
});
