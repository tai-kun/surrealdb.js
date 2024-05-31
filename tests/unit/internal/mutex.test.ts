"use prelude";

import { mutex } from "@tai-kun/surrealdb/internal";

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

test("concurrency should be 1", async () => {
  class Runner {
    resultWithQueue: string[] = [];
    resultWithoutQueue: string[] = [];

    @mutex
    async withQueue(ms: number, value: string) {
      await sleep(ms);
      this.resultWithQueue.push(value);
    }

    async withoutQueue(ms: number, value: string) {
      await sleep(ms);
      this.resultWithoutQueue.push(value);
    }
  }

  const runner = new Runner();
  await Promise.all([
    // withQueue
    runner.withQueue(1000, "A"),
    runner.withQueue(500, "B"),
    runner.withQueue(0, "C"),
    // withoutQueue
    runner.withoutQueue(1000, "A"),
    runner.withoutQueue(500, "B"),
    runner.withoutQueue(0, "C"),
  ]);

  assertDeepEquals(runner.resultWithQueue, ["A", "B", "C"]);
  assertDeepEquals(runner.resultWithoutQueue, ["C", "B", "A"]);
});
