import { MissingNamespaceError } from "@tai-kun/surrealdb/errors";
import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

const TIME_REGEX = /^\d+(\.\d+)?\D+$/; // e.g. 26.536µs

for (const { suite, eng, url, Surreal } of surreal) {
  describe(suite, () => {
    test("特定の名前空間に切り替える", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      {
        const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

        expect(info).toStrictEqual([
          {
            result: "Specify a namespace to use",
            status: "ERR",
            time: expect.stringMatching(TIME_REGEX),
          },
          {
            result: "Specify a namespace to use",
            status: "ERR",
            time: expect.stringMatching(TIME_REGEX),
          },
        ]);
        expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
          namespace: null,
          database: null,
        }));
      }

      await db.use("my_namespace");

      {
        const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

        expect(info).toStrictEqual([
          {
            result: expect.objectContaining({
              databases: {},
            }),
            status: "OK",
            time: expect.stringMatching(TIME_REGEX),
          },
          {
            result: "Specify a database to use",
            status: "ERR",
            time: expect.stringMatching(TIME_REGEX),
          },
        ]);
        expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
          namespace: "my_namespace",
          database: null,
        }));
      }
    });

    test("特定の名前空間とデータベースに切り替える", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.use("my_namespace", "my_database");

      {
        const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

        expect(info).toStrictEqual([
          {
            result: expect.objectContaining({
              databases: {},
            }),
            status: "OK",
            time: expect.stringMatching(TIME_REGEX),
          },
          {
            result: expect.objectContaining({
              tables: {},
            }),
            status: "OK",
            time: expect.stringMatching(TIME_REGEX),
          },
        ]);
        expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
          namespace: "my_namespace",
          database: "my_database",
        }));
      }
    });

    test("名前空間だけを切り替える", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.use("my_namespace", "my_database");
      await db.use("my_namespace_2");

      {
        const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

        expect(info).toStrictEqual([
          {
            result: expect.objectContaining({
              // TODO(tai-kun): my_namespace_2 を見分ける必要あるのでは。
              databases: {},
            }),
            status: "OK",
            time: expect.stringMatching(TIME_REGEX),
          },
          {
            result: expect.objectContaining({
              tables: {},
            }),
            status: "OK",
            time: expect.stringMatching(TIME_REGEX),
          },
        ]);
        expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
          namespace: "my_namespace_2",
          database: "my_database",
        }));
      }
    });

    test("データベースだけを切り替える", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.use("my_namespace", "my_database");
      await db.use(undefined, "my_database_2");

      {
        const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

        expect(info).toStrictEqual([
          {
            result: expect.objectContaining({
              databases: {},
            }),
            status: "OK",
            time: expect.stringMatching(TIME_REGEX),
          },
          {
            result: expect.objectContaining({
              // TODO(tai-kun): my_database_2 を見分ける必要あるのでは。
              tables: {},
            }),
            status: "OK",
            time: expect.stringMatching(TIME_REGEX),
          },
        ]);
        expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
          namespace: "my_namespace",
          database: "my_database_2",
        }));
      }
    });

    test(
      "選択しているデータベースを未選択に戻せない",
      { skip: eng === "http" },
      async () => {
        await using db = new Surreal();
        await db.connect(url());
        await db.signin({ user: "root", pass: "root" });

        await db.use("my_namespace", "my_database");
        await db.use("my_namespace", null);

        {
          const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

          expect(info).toStrictEqual([
            {
              result: expect.objectContaining({
                databases: {},
              }),
              status: "OK",
              time: expect.stringMatching(TIME_REGEX),
            },
            {
              result: expect.objectContaining({
                tables: {},
              }),
              status: "OK",
              time: expect.stringMatching(TIME_REGEX),
            },
          ]);
          expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
            namespace: "my_namespace",
            database: null,
          }));
        }
      },
    );

    test(
      "選択しているデータベースを未選択に戻すとエラー",
      { skip: eng === "websocket" },
      async () => {
        await using db = new Surreal();
        await db.connect(url());
        await db.signin({ user: "root", pass: "root" });

        await db.use("my_namespace", "my_database");
        await db.use("my_namespace", null);

        {
          const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

          expect(info).toStrictEqual([
            {
              result: expect.objectContaining({
                databases: {},
              }),
              status: "OK",
              time: expect.stringMatching(TIME_REGEX),
            },
            {
              result: "Specify a database to use",
              status: "ERR",
              time: expect.stringMatching(TIME_REGEX),
            },
          ]);
          expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
            namespace: "my_namespace",
            database: null,
          }));
        }
      },
    );

    test("データベースだけを指定することはできない", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await expect(db.use(undefined, "my_database"))
        .rejects
        .toThrowError(MissingNamespaceError);
      expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
        namespace: null,
        database: null,
      }));
    });

    test("名前空間だけ未選択に戻すことはできない", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.use("my_namespace", "my_database");

      await expect(db.use(null, "my_database"))
        .rejects
        .toThrowError(MissingNamespaceError);
      expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
        namespace: "my_namespace",
        database: "my_database",
      }));
    });

    test(
      "名前空間とデータベースを共に未選択に戻せない",
      { skip: eng === "http" },
      async () => {
        await using db = new Surreal();
        await db.connect(url());
        await db.signin({ user: "root", pass: "root" });

        await db.use("my_namespace", "my_database");
        await db.use(null, null);

        {
          const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

          expect(info).toStrictEqual([
            {
              result: expect.objectContaining({
                databases: {},
              }),
              status: "OK",
              time: expect.stringMatching(TIME_REGEX),
            },
            {
              result: expect.objectContaining({
                tables: {},
              }),
              status: "OK",
              time: expect.stringMatching(TIME_REGEX),
            },
          ]);
          expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
            namespace: null,
            database: null,
          }));
        }
      },
    );

    test("名前空間とデータベースを共に未選択に戻すとエラー", {
      skip: eng === "websocket",
    }, async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.use("my_namespace", "my_database");
      await db.use(null, null);

      {
        const info = await db.queryRaw(/*surql*/ `
          INFO FOR NS;
          INFO FOR DB;
        `);

        expect(info).toStrictEqual([
          {
            result: "Specify a namespace to use",
            status: "ERR",
            time: expect.stringMatching(TIME_REGEX),
          },
          {
            result: "Specify a namespace to use",
            status: "ERR",
            time: expect.stringMatching(TIME_REGEX),
          },
        ]);
        expect(db.getConnectionInfo()).toStrictEqual(expect.objectContaining({
          namespace: null,
          database: null,
        }));
      }
    });
  });
}
