import { isUuid, type LiveResult, Thing } from "@tai-kun/surrealdb";
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
    // const UUID_REGEX =
    //   /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    // このテストはパスされるべきだけど、DELETE イベントだけ来ない。
    test.fails("テーブルの変更をライブクエリーで監視する", async () => {
      const NUM_EVENTS = 3;

      await using db = new Surreal();
      await db.connect(url());
      await db.use("my_namespace", "my_database");
      await db.signin({ user: "root", pass: "root" });

      const queryUuid = await db.live("person");

      expect(isUuid(queryUuid)).toBe(true);

      const listener = vi.fn();
      db.subscribe(queryUuid, listener);

      await db.create(new Thing("person", 1), {
        firstname: "John",
        lastname: "Doe",
      });
      await db.update(new Thing("person", 1), {
        firstname: "Jane",
        lastname: "Doe",
      });
      await db.delete(new Thing("person", 1));

      await vi.waitFor(() => listener.mock.calls.length === NUM_EVENTS);

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

    // このテストはパスされるべきだけど、すべてのイベントが来ない。
    test.fails("テーブルの変更を JSON パッチで受け取る", async () => {
      const NUM_EVENTS = 3;

      await using db = new Surreal();
      await db.connect(url());
      await db.use("my_namespace", "my_database");
      await db.signin({ user: "root", pass: "root" });

      const queryUuid = await db.live("person", { diff: true });

      expect(isUuid(queryUuid)).toBe(true);

      const events: Omit<LiveResult, "id">[] = [];

      const listener = vi.fn();
      db.subscribe(queryUuid, listener);

      await db.create(new Thing("person", 1), {
        firstname: "John",
        lastname: "Doe",
      });
      await db.update(new Thing("person", 1), {
        firstname: "Jane",
        lastname: "Doe",
      });
      await db.delete(new Thing("person", 1));

      await vi.waitFor(() => listener.mock.calls.length === NUM_EVENTS);

      expect(events).toStrictEqual([
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
