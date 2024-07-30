import { TaskEmitter } from "@tai-kun/surrealdb/utils";
import { describe, expect, test, vi } from "vitest";

test("イベントリスナーを登録して、イベントを補足する", async () => {
  type Events = {
    foo: [number];
    bar: [string, boolean];
  };
  const foo = vi.fn((_, ...args): any => args);
  const bar = vi.fn((_, ...args): any => args);
  const e = new TaskEmitter<Events>();

  e.on("foo", foo);
  e.on("bar", bar);

  e.emit("foo", 1);
  e.emit("bar", "test", true);

  expect(foo).toHaveBeenCalledOnce();
  expect(foo).toHaveReturnedWith([1]);
  expect(bar).toHaveBeenCalledOnce();
  expect(bar).toHaveReturnedWith(["test", true]);
});

test("イベントリスナーの登録を解除すると、以降のイベントを補足しない", async () => {
  type Events = {
    foo: [number];
  };
  const foo1 = vi.fn((_, ...args): any => args);
  const foo2 = vi.fn((_, ...args): any => args);
  const e = new TaskEmitter<Events>();

  e.on("foo", foo1);
  e.on("foo", foo2);

  e.emit("foo", 1);

  e.off("foo", foo1);

  e.emit("foo", 2);

  expect(foo1).toHaveBeenCalledOnce();
  expect(foo1.mock.results).toStrictEqual([
    { type: "return", value: [1] },
  ]);
  expect(foo2).toHaveBeenCalledTimes(2);
  expect(foo2.mock.results).toStrictEqual([
    { type: "return", value: [1] },
    { type: "return", value: [2] },
  ]);
});

test("イベントを一度だけ補足する", async () => {
  type Events = {
    foo: [number];
  };
  const foo = vi.fn(result => result);
  const e = new TaskEmitter<Events>();

  e.once("foo").then(foo);

  await Promise.all(e.emit("foo", 1) || []);

  e.once("foo").then(foo);
  e.once("foo").then(foo);

  await Promise.all(e.emit("foo", 2) || []);
  await Promise.all(e.emit("foo", 3) || []);

  expect(foo.mock.results).toStrictEqual([
    { type: "return", value: [1] },
    { type: "return", value: [2] },
    { type: "return", value: [2] },
  ]);
});

test("イベントを一度だけ補足するとき、すでに中止されていたら拒否する", async () => {
  type Events = {
    foo: [number];
  };
  const e = new TaskEmitter<Events>();
  const c = new AbortController();
  c.abort();

  await expect(async () => await e.once("foo", { signal: c.signal }))
    .rejects
    .toThrow();
});

test("イベントを一度だけ補足するとき、中止イベントを受け取ったら拒否する", async () => {
  type Events = {
    foo: [number];
  };
  const e = new TaskEmitter<Events>();
  const c = new AbortController();

  await expect(async () => {
    const p = e.once("foo", { signal: c.signal });
    setTimeout(() => c.abort());
    await p;
  })
    .rejects
    .toThrow();
});

describe("ドキュメントの例", () => {
  test("イベントを補足する", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        type Events = {
          log: string[];
        };

        const emitter = new TaskEmitter<Events>();

        emitter.on("log", (_, ...args) => {
          console.log(...args);
        });

        emitter.emit("log", "Hello");
        emitter.emit("log", "World", "!!!");

        await emitter.idle();
      }

      // Test
      {
        await vi.waitUntil(() => spy.mock.calls.length === 2);
        expect(spy.mock.calls).toStrictEqual([
          ["Hello"],
          ["World", "!!!"],
        ]);
      }
    } finally {
      // Clean up

      spy.mockClear();
    }
  });

  test("イベントを 1 度だけ補足する", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        type Events = {
          log: string[];
        };

        const emitter = new TaskEmitter<Events>();

        const promise = emitter.once("log");

        emitter.emit("log", "Hello");
        emitter.emit("log", "World", "!!!");

        const recived = await promise;
        console.log(recived);

        await emitter.idle();
      }

      // Test
      {
        expect(spy.mock.calls).toStrictEqual([
          [["Hello"]],
        ]);
      }
    } finally {
      // Clean up

      spy.mockClear();
    }
  });
});
