import { makeAbortApi } from "@tai-kun/surrealdb/utils";
import { describe, expect, test, vi } from "vitest";

test("AbortSignal オブジェクトと関数を返す", () => {
  const [signal, abort] = makeAbortApi();

  expect(signal).toBeInstanceOf(AbortSignal);
  expect(abort).toBeTypeOf("function");
  expect(signal.aborted).toBe(false);
  expect(signal.reason).toBeUndefined();
});

test("シグナルがすでに中断を示していたらその理由を投げる", () => {
  const c = new AbortController();
  const e = new Error("test");
  c.abort(e);
  const fn = () => {
    makeAbortApi(c.signal);
  };

  expect(fn).toThrow(e);
});

test("中止する", async () => {
  const [signal, abort] = makeAbortApi();
  const reason = {};
  abort(reason);

  expect(signal.aborted).toBe(true);
  expect(signal.reason).toBe(reason);
});

test("中止イベントを受け取る", async () => {
  const [signal, abort] = makeAbortApi();
  const listener = vi.fn();
  signal.addEventListener("abort", listener);
  abort();

  expect(listener.mock.calls).toHaveLength(1);
});

test("複数回中止した場合は最初の 1 回だけ実行される", () => {
  const [signal, abort] = makeAbortApi();
  abort({});
  const reason = {};
  abort(reason);

  expect(signal.reason).not.toBe(reason);
});

test("オプションのシグナルに中止の情報を伝播する", async () => {
  const c = new AbortController();
  const [signal] = makeAbortApi(c.signal);
  const reason = {};
  c.abort(reason);

  expect(signal).not.toBe(c.signal);
  expect(signal.aborted).toBe(true);
  expect(signal.reason).toBe(reason);
  expect(c.signal.aborted).toBe(true);
  expect(c.signal.reason).toBe(reason);
});

describe("ドキュメントの例", () => {
  test("中止シグナルを関連付ける", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        const controller = new AbortController();
        controller.signal.addEventListener("abort", function() {
          console.log("controller.signal", this.reason);
        });

        const [signal] = makeAbortApi(controller.signal);
        signal.addEventListener("abort", function() {
          console.log("signal", this.reason);
        });

        controller.abort("test");
      }

      // Test
      {
        await vi.waitUntil(() => spy.mock.calls.length === 2);
        expect(spy.mock.calls).toStrictEqual([
          ["controller.signal", "test"],
          ["signal", "test"],
        ]);
      }
    } finally {
      // Clean up

      spy.mockClear();
    }
  });

  test("Abort API から中止する", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        const controller = new AbortController();
        controller.signal.addEventListener("abort", function() {
          console.log("controller.signal", this.reason);
        });

        const [signal, abort] = makeAbortApi(controller.signal);
        signal.addEventListener("abort", function() {
          console.log("signal", this.reason);
        });

        abort("test");
      }

      // Test
      {
        await vi.waitUntil(() => spy.mock.calls.length === 2);
        expect(spy.mock.calls).toStrictEqual([
          ["controller.signal", "test"],
          ["signal", "test"],
        ]);
      }
    } finally {
      // Clean up

      spy.mockClear();
    }
  });
});
