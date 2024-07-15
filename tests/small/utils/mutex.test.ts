import { mutex } from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { test } from "@tools/test";

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

test("同時実行性が 1 である", async () => {
  class Runner {
    resultWithMutex: string[] = [];
    resultWithoutMutex: string[] = [];

    @mutex
    async withMutex(ms: number, value: string) {
      await sleep(ms);
      this.resultWithMutex.push(value);
    }

    async withoutMutex(ms: number, value: string) {
      await sleep(ms);
      this.resultWithoutMutex.push(value);
    }
  }

  const runner = new Runner();
  await Promise.all([
    runner.withMutex(1000, "A"),
    runner.withMutex(500, "B"),
    runner.withMutex(0, "C"),
    runner.withoutMutex(1000, "A"),
    runner.withoutMutex(500, "B"),
    runner.withoutMutex(0, "C"),
  ]);

  assert.deepEqual(
    runner.resultWithMutex,
    ["A", "B", "C"],
    "mutex を使うと実行順に処理が進むべきです。",
  );
  assert.deepEqual(
    runner.resultWithoutMutex,
    ["C", "B", "A"],
    "mutex を使わないと遅延時間の順番で処理が終わるべきです。",
  );
});
