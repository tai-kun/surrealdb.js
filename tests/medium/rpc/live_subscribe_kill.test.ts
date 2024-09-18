import {
  type DataType,
  isUuid,
  type LiveAction,
  type Patch,
  Thing,
} from "@tai-kun/surrealdb";
import { RpcResponseError } from "@tai-kun/surrealdb/errors";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import surreal from "../surreal.js";

for (const { suite, eng, fmt, url, Surreal } of surreal) {
  describe.runIf(eng === "http")(suite, () => {
    test("HTTP エンジンではライブクエリーがサポートされていない", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.use("my_namespace", "my_database");

      await expect(db.live("person")).rejects.toThrowError(RpcResponseError);
    });
  });

  describe.runIf(eng === "websocket" && fmt === "cbor")(suite, () => {
    test("テーブルの変更をライブクエリーで監視する", async () => {
      const NUM_EVENTS = 3;
      const listener = vi.fn();

      await using db = new Surreal();
      await db.connect(url());
      await db.use("my_namespace", "my_database");
      await db.signin({ user: "root", pass: "root" });

      const queryUuid = await db.live("person");

      expect.soft(isUuid(queryUuid)).toBe(true);

      db.subscribe(queryUuid, (_, payload) => {
        listener(payload);

        expectTypeOf(payload).toEqualTypeOf<
          {
            action: LiveAction;
            record: string | DataType.Thing;
            result: { [p: string]: unknown };
          }
        >();
      });

      // Dispatch events
      {
        await db.create(new Thing("person", 1), {
          firstname: "John",
          lastname: "Doe",
        });
        await db.update(new Thing("person", 1), {
          firstname: "Jane",
          lastname: "Doe",
        });
        await db.delete(new Thing("person", 1));
      }

      await vi.waitUntil(() => listener.mock.calls.length === NUM_EVENTS);

      expect(listener.mock.calls.flat()).toStrictEqual([
        {
          action: "CREATE",
          record: new Thing("person", 1),
          result: {
            id: new Thing("person", 1),
            firstname: "John",
            lastname: "Doe",
          },
        },
        {
          action: "UPDATE",
          record: new Thing("person", 1),
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        },
        {
          action: "DELETE",
          record: new Thing("person", 1),
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        },
      ]);
    });

    test("テーブルの変更を JSON パッチで受け取る", async () => {
      const NUM_EVENTS = 3;
      const listener = vi.fn();

      await using db = new Surreal();
      await db.connect(url());
      await db.use("my_namespace", "my_database");
      await db.signin({ user: "root", pass: "root" });

      const queryUuid = await db.live("person", { diff: true });

      expect.soft(isUuid(queryUuid)).toBe(true);

      db.subscribe(queryUuid, (_, payload) => {
        listener(payload);

        expectTypeOf(payload).toEqualTypeOf<
          {
            action: "CREATE" | "UPDATE";
            record: string | DataType.Thing;
            result: Patch[];
          } | {
            action: "DELETE";
            record: string | DataType.Thing;
            result: { [p: string]: unknown };
          }
        >();
      });

      // Dispatch events
      {
        await db.create(new Thing("person", 1), {
          firstname: "John",
          lastname: "Doe",
        });
        await db.update(new Thing("person", 1), {
          firstname: "Jane",
          lastname: "Doe",
        });
        await db.delete(new Thing("person", 1));
      }

      await vi.waitUntil(() => listener.mock.calls.length === NUM_EVENTS);

      expect(listener.mock.calls.flat()).toStrictEqual([
        {
          action: "CREATE",
          record: new Thing("person", 1),
          result: [
            {
              op: "replace",
              path: "/",
              value: {
                id: new Thing("person", 1),
                firstname: "John",
                lastname: "Doe",
              },
            },
          ],
        },
        {
          action: "UPDATE",
          record: new Thing("person", 1),
          result: [
            {
              op: "change",
              path: "/firstname",
              value: "@@ -1,4 +1,4 @@\n J\n-ohn\n+ane\n",
            },
          ],
        },
        {
          action: "DELETE",
          record: new Thing("person", 1),
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        },
      ]);
    });
  });

  describe.runIf(eng === "websocket" && fmt === "json")(suite, () => {
    test("テーブルの変更をライブクエリーで監視する", async () => {
      const NUM_EVENTS = 3;
      const listener = vi.fn();

      await using db = new Surreal();
      await db.connect(url());
      await db.use("my_namespace", "my_database");
      await db.signin({ user: "root", pass: "root" });

      const queryUuid = await db.live("person");

      expect.soft(queryUuid).toBeTypeOf("string");

      db.subscribe(queryUuid, (_, payload) => {
        listener(payload);

        expectTypeOf(payload).toEqualTypeOf<
          {
            action: LiveAction;
            record: string | DataType.Thing;
            result: { [p: string]: unknown };
          }
        >();
      });

      // Dispatch events
      {
        await db.create(new Thing("person", 1), {
          firstname: "John",
          lastname: "Doe",
        });
        await db.update(new Thing("person", 1), {
          firstname: "Jane",
          lastname: "Doe",
        });
        await db.delete(new Thing("person", 1));
      }

      await vi.waitUntil(() => listener.mock.calls.length === NUM_EVENTS);

      expect(listener.mock.calls.flat()).toStrictEqual([
        {
          action: "CREATE",
          record: "person:1",
          result: {
            id: "person:1",
            firstname: "John",
            lastname: "Doe",
          },
        },
        {
          action: "UPDATE",
          record: "person:1",
          result: {
            id: "person:1",
            firstname: "Jane",
            lastname: "Doe",
          },
        },
        {
          action: "DELETE",
          record: "person:1",
          result: {
            id: "person:1",
            firstname: "Jane",
            lastname: "Doe",
          },
        },
      ]);
    });

    test("テーブルの変更を JSON パッチで受け取る", async () => {
      const NUM_EVENTS = 3;
      const listener = vi.fn();

      await using db = new Surreal();
      await db.connect(url());
      await db.use("my_namespace", "my_database");
      await db.signin({ user: "root", pass: "root" });

      const queryUuid = await db.live("person", { diff: true });

      expect.soft(queryUuid).toBeTypeOf("string");

      db.subscribe(queryUuid, (_, payload) => {
        listener(payload);

        expectTypeOf(payload).toEqualTypeOf<
          {
            action: "CREATE" | "UPDATE";
            record: string | DataType.Thing;
            result: Patch[];
          } | {
            action: "DELETE";
            record: string | DataType.Thing;
            result: { [p: string]: unknown };
          }
        >();
      });

      // Dispatch events
      {
        await db.create(new Thing("person", 1), {
          firstname: "John",
          lastname: "Doe",
        });
        await db.update(new Thing("person", 1), {
          firstname: "Jane",
          lastname: "Doe",
        });
        await db.delete(new Thing("person", 1));
      }

      await vi.waitUntil(() => listener.mock.calls.length === NUM_EVENTS);

      expect(listener.mock.calls.flat()).toStrictEqual([
        {
          action: "CREATE",
          record: "person:1",
          result: [
            {
              op: "replace",
              path: "/",
              value: {
                id: "person:1",
                firstname: "John",
                lastname: "Doe",
              },
            },
          ],
        },
        {
          action: "UPDATE",
          record: "person:1",
          result: [
            {
              op: "change",
              path: "/firstname",
              value: "@@ -1,4 +1,4 @@\n J\n-ohn\n+ane\n",
            },
          ],
        },
        {
          action: "DELETE",
          record: "person:1",
          result: {
            id: "person:1",
            firstname: "Jane",
            lastname: "Doe",
          },
        },
      ]);
    });
  });
}
