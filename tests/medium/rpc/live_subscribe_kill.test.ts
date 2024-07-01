import { isUuid, type LiveResult } from "@tai-kun/surreal";
import { Thing } from "@tai-kun/surreal/full";
import {
  assert,
  assertDeepEquals,
  assertMatch,
  assertRejects,
} from "@tools/assert";
import { before, describe, test } from "@tools/test";
import surreal from "../surreal.js";

for (
  const {
    engine,
    formatter,
    validator,
    initSurreal,
  } of surreal
) {
  describe([engine, formatter, validator].join("-"), {
    skip: !(engine === "http"),
  }, () => {
    before(async () => {
      await surreal.ready;
    });

    test("HTTP プロトコルではライブクエリーがサポートされていない", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.use("my_namespace", "my_database");

      await assertRejects(async () => {
        await db.live("person");
      });
    });
  });

  describe([engine, formatter, validator].join("-"), {
    skip: !(engine === "ws" && formatter === "cbor"),
  }, () => {
    before(async () => {
      await surreal.ready;
    });

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    async function withTimeout(p: Promise<void>, ms: number): Promise<void> {
      const { promise, resolve, reject } = Promise.withResolvers<void>();
      const timeout = setTimeout(() => reject(new Error("Timeout")), ms);
      await Promise.race([
        promise,
        p.then(resolve).finally(() => clearTimeout(timeout)),
      ]);
    }

    test("テーブルの変更をライブクエリーで監視する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.use("my_namespace", "my_database");
      const queryUuid = await db.live("person");

      if (typeof queryUuid === "string") {
        assertMatch(queryUuid, UUID_REGEX);
      } else {
        assert(isUuid(queryUuid));
      }

      const events: Omit<LiveResult, "id">[] = [];
      const { promise, resolve } = Promise.withResolvers<void>();
      db.subscribe(queryUuid, (_, event) => {
        events.push(event);

        if (event.action === "DELETE") {
          resolve();
        }
      });

      await db.create(new Thing("person", 1), {
        firstname: "John",
        lastname: "Doe",
      });
      await db.update(new Thing("person", 1), {
        firstname: "Jane",
        lastname: "Doe",
      });
      await db.delete(new Thing("person", 1));

      await withTimeout(promise, 5e3); // Wait for the DELETE event

      assertDeepEquals(events, [
        {
          action: "CREATE",
          result: {
            id: new Thing("person", 1),
            firstname: "John",
            lastname: "Doe",
          },
        },
        {
          action: "UPDATE",
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        },
        {
          action: "DELETE",
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        },
      ]);
    });

    test("テーブルの変更を JSON パッチで受け取る", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.use("my_namespace", "my_database");
      const queryUuid = await db.live("person", { diff: true });

      if (typeof queryUuid === "string") {
        assertMatch(queryUuid, UUID_REGEX);
      } else {
        assert(isUuid(queryUuid));
      }

      const events: Omit<LiveResult, "id">[] = [];
      const { promise, resolve } = Promise.withResolvers<void>();
      db.subscribe(queryUuid, (_, event) => {
        events.push(event);

        if (event.action === "DELETE") {
          resolve();
        }
      });

      await db.create(new Thing("person", 1), {
        firstname: "John",
        lastname: "Doe",
      });
      await db.update(new Thing("person", 1), {
        firstname: "Jane",
        lastname: "Doe",
      });
      await db.delete(new Thing("person", 1));

      await withTimeout(promise, 5e3); // Wait for the DELETE event

      assertDeepEquals(events, [
        {
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
        },
        {
          action: "UPDATE",
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
          result: {
            id: new Thing("person", 1),
            firstname: "Jane",
            lastname: "Doe",
          },
        },
      ]);
    });
  });
}
