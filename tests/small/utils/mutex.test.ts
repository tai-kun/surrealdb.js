import { mutex } from "@tai-kun/surrealdb/utils";
import { describe, expect, test, vi } from "vitest";

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

describe("ドキュメントの例", () => {
  test("同時実行性が 1 である", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        class Runner {
          async runWithoutMutex(ms: number, value: string) {
            await sleep(ms);
            console.log(value);
          }

          @mutex
          async runWithMutex(ms: number, value: string) {
            await sleep(ms);
            console.log(value);
          }
        }

        const runner = new Runner();
        // without mutex
        await Promise.all([
          runner.runWithoutMutex(1000, "A"),
          runner.runWithoutMutex(500, "B"),
          runner.runWithoutMutex(0, "C"),
        ]);
        // with mutex
        await Promise.all([
          runner.runWithMutex(1000, "A"),
          runner.runWithMutex(500, "B"),
          runner.runWithMutex(0, "C"),
        ]);
      }

      // Test
      {
        await vi.waitUntil(() => spy.mock.calls.length === 6);
        expect(spy.mock.calls).toStrictEqual([
          // without mutex
          ["C"],
          ["B"],
          ["A"],
          // with mutex
          ["A"],
          ["B"],
          ["C"],
        ]);
      }
    } finally {
      // Clean up

      spy.mockClear();
    }
  });
});
