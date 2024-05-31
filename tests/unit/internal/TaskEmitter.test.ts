"use prelude";

import {
  TaskEmitter as _TaskEmitter,
  type TaskListener,
} from "@tai-kun/surrealdb/internal";

// @ts-expect-error
Symbol.asyncDispose ||= Symbol.for("Symbol.asyncDispose");

class TaskEmitter<T extends Record<string | number, unknown[]>>
  extends _TaskEmitter<T>
  implements AsyncDisposable
{
  async [Symbol.asyncDispose](): Promise<void> {
    const result = await this.dispose();

    if (!result.ok) {
      throw result.error;
    }
  }
}

test("should listen for events", async () => {
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

test("should stop listening for events", async () => {
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

test("should stop listening for all events", async () => {
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

test("should listen once for events", async () => {
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
    await Promise.all(emitter.emit("foo", 2) || []);
  }

  assertDeepEquals(events, [[1]]);
});

test("should reject if the event has been aborted", async () => {
  type Events = {
    foo: [number];
  };

  await assertRejects(
    async () => {
      await using emitter = new TaskEmitter<Events>();
      const ac = new AbortController();
      ac.abort();
      await emitter.once("foo", { signal: ac.signal });
    },
    Error,
    " aborted",
  );
});

test("should reject if the event is aborted", async () => {
  type Events = {
    foo: [number];
  };

  await assertRejects(
    async () => {
      await using emitter = new TaskEmitter<Events>();
      const ac = new AbortController();
      const promise = emitter.once("foo", { signal: ac.signal });
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
});
