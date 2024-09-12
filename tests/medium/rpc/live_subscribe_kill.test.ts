import { isUuid, Thing } from "@tai-kun/surrealdb";
import { RpcResponseError } from "@tai-kun/surrealdb/errors";
import { describe, expect, test, vi } from "vitest";
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

      db.subscribe(queryUuid, listener);

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

      expect(listener.mock.calls).toStrictEqual([
        [expect.anything(), {
          action: "CREATE",
          result: {
            id: new Thing("person", 1),
            firstname: "John",
            lastname: "Doe",
          },
        }],
        [expect.anything(), {
          action: "UPDATE",
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        }],
        [expect.anything(), {
          action: "DELETE",
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        }],
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

      db.subscribe(queryUuid, listener);

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

      expect(listener.mock.calls).toStrictEqual([
        [expect.anything(), {
          action: "CREATE",
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
        }],
        [expect.anything(), {
          action: "UPDATE",
          result: [
            {
              op: "change",
              path: "/firstname",
              value: "@@ -1,4 +1,4 @@\n J\n-ohn\n+ane\n",
            },
          ],
        }],
        [expect.anything(), {
          action: "DELETE",
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        }],
      ]);
    });
  });
}
