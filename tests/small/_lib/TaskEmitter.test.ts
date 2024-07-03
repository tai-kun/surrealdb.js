import {
  TaskEmitter as _TaskEmitter,
  type TaskListener,
} from "@tai-kun/surreal/_lib";
import { assertDeepEquals, assertEquals, assertRejects } from "@tools/assert";
import { test } from "@tools/test";

// @ts-expect-error
Symbol.asyncDispose ||= Symbol.for("Symbol.asyncDispose");

class TaskEmitter<T extends Record<string | number, unknown[]>>
  extends _TaskEmitter<T>
  implements AsyncDisposable
{
  async [Symbol.asyncDispose](): Promise<void> {
    await this.dispose();
  }
}

test("イベントリスナーを登録して、イベントを補足する", async () => {
  type Events = {
    foo: [number];
    bar: [string, boolean];
  };
  const events: Events[keyof Events][] = [];
  const listener: TaskListener<Events[keyof Events]> = (_, ...args) => {
    events.push(args);
  };
  let fooListeners: any = 0;
  let barListeners: any = 0;

  {
    await using emitter = new TaskEmitter<Events>();

    emitter.on("foo", listener);
    emitter.on("bar", listener);

    fooListeners = emitter.emit("foo", 1)?.length;
    barListeners = emitter.emit("bar", "test", true)?.length;
  }

  assertDeepEquals(
    events.sort((a, b) => a.length - b.length),
    [
      [1],
      ["test", true],
    ],
  );
  assertEquals(fooListeners, 1);
  assertEquals(barListeners, 1);
});

test("イベントリスナーの登録を解除すると、以降のイベントを補足しない", async () => {
  type Events = {
    foo: [number];
  };
  const events1: Events[keyof Events][] = [];
  const events2: Events[keyof Events][] = [];
  const listener1: TaskListener<Events[keyof Events]> = (_, ...args) => {
    events1.push(args);
  };
  const listener2: TaskListener<Events[keyof Events]> = (_, ...args) => {
    events2.push(args);
  };

  {
    await using emitter = new TaskEmitter<Events>();

    emitter.on("foo", listener1);
    emitter.on("foo", listener2);

    emitter.emit("foo", 1);

    emitter.off("foo", listener1); // stop listening for `foo`

    emitter.emit("foo", 2);
  }

  assertDeepEquals(events1, [[1]]);
  assertDeepEquals(
    events2.sort(([a], [b]) => a - b),
    [
      [1],
      [2],
    ],
  );
});

test("特定のイベントのすべてのイベントリスナーを解除する", async () => {
  type Events = {
    foo: [number];
  };
  const events1: Events[keyof Events][] = [];
  const events2: Events[keyof Events][] = [];
  const listener1: TaskListener<Events[keyof Events]> = (_, ...args) => {
    events1.push(args);
  };
  const listener2: TaskListener<Events[keyof Events]> = (_, ...args) => {
    events2.push(args);
  };

  {
    await using emitter = new TaskEmitter<Events>();

    emitter.on("foo", listener1);
    emitter.on("foo", listener2);

    emitter.emit("foo", 1);

    emitter.off("foo"); // stop listening for `foo`

    emitter.emit("foo", 2);
  }

  assertDeepEquals(events1, [[1]]);
  assertDeepEquals(events2, [[1]]);
});

test("イベントを一度だけ補足する", async () => {
  type Events = {
    foo: [number];
  };
  const events: Events[keyof Events][] = [];
  const listener = (args: Events[keyof Events]) => {
    events.push(args);
  };

  {
    await using emitter = new TaskEmitter<Events>();

    emitter.once("foo").then(listener);

    await Promise.all(emitter.emit("foo", 1) || []);

    emitter.once("foo").then(listener);
    emitter.once("foo").then(listener);

    await Promise.all(emitter.emit("foo", 2) || []);

    await Promise.all(emitter.emit("foo", 3) || []);
  }

  assertDeepEquals(events, [
    [1],
    [2],
    [2],
  ]);
});

test("イベントを一度だけ補足する際、すでに中止されていたら例外を投げる", async () => {
  type Events = {
    foo: [number];
  };

  await assertRejects(
    async () => {
      await using emitter = new TaskEmitter<Events>();
      const controller = new AbortController();
      controller.abort();
      await emitter.once("foo", { signal: controller.signal });
    },
    Error,
    "abort",
  );
});

test("イベントを一度だけ補足する際、途中で中止されたら例外を投げる", async () => {
  type Events = {
    foo: [number];
  };

  await assertRejects(
    async () => {
      await using emitter = new TaskEmitter<Events>();
      const controller = new AbortController();
      const promise = emitter.once("foo", { signal: controller.signal });
      setTimeout(() => controller.abort(new Error("test")), 500);
      await promise;
    },
    Error,
    "test",
  );
});
