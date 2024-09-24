import { type DataType, type Patch, Table, Thing } from "@tai-kun/surrealdb";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
} from "vitest";
import surreal from "../surreal.js";

for (const { suite, fmt, url, Surreal } of surreal) {
  describe(suite, { skip: fmt === "json" }, () => {
    let db: InstanceType<typeof Surreal>;

    beforeEach(async () => {
      db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });
      await db.use(suite, "db");
    });

    afterEach(async () => {
      await db.close();
    });

    describe("create", () => {
      beforeEach(async () => {
        await db.query("DEFINE TABLE user SCHEMALESS");
      });

      afterEach(async () => {
        await db.query("REMOVE TABLE user");
      });

      test("テーブル名でレコードを作成する", async () => {
        const record = await db.create<{ name: string }>("user", {
          name: "ichiro",
        });

        expectTypeOf<typeof record>().toEqualTypeOf<
          { id: string | DataType.Thing } & {
            name: string;
          }
        >();

        expect(record).toStrictEqual(
          {
            id: expect.objectContaining({
              table: "user",
              id: expect.stringMatching(/^[0-9a-z]{20}$/),
            }),
            name: "ichiro",
          },
        );
      });

      test("テーブルオブジェクトでレコードを作成する", async () => {
        const record = await db.create<{ name: string }>(new Table("user"), {
          name: "jiro",
        });

        expectTypeOf<typeof record>().toEqualTypeOf<
          { id: string | DataType.Thing } & {
            name: string;
          }
        >();

        expect(record).toStrictEqual(
          {
            id: expect.objectContaining({
              table: "user",
              id: expect.stringMatching(/^[0-9a-z]{20}$/),
            }),
            name: "jiro",
          },
        );
      });

      test("レコード ID でレコードを作成する", async () => {
        const record = await db.create<{ name: string }>(
          new Thing("user", "X"),
          {
            name: "saburo",
          },
        );

        expectTypeOf<typeof record>().toEqualTypeOf<
          { id: string | DataType.Thing } & {
            name: string;
          }
        >();

        expect(record).toStrictEqual({
          id: expect.objectContaining({
            table: "user",
            id: "X",
          }),
          name: "saburo",
        });
      });
    });

    describe("insert", () => {
      beforeEach(async () => {
        await db.query("DEFINE TABLE user SCHEMALESS");
      });

      afterEach(async () => {
        await db.query("REMOVE TABLE user");
      });

      test("テーブル名でレコードを作成する", async () => {
        const records = await db.insert<{ name: string }>("user", {
          name: "ichiro",
        });

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: expect.stringMatching(/^[0-9a-z]{20}$/),
            }),
            name: "ichiro",
          },
        ]);
      });

      test("テーブルオブジェクトでレコードを作成する", async () => {
        const records = await db.insert<{ name: string }>(new Table("user"), [
          {
            name: "ichiro",
          },
          {
            name: "jiro",
          },
        ]);

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: expect.stringMatching(/^[0-9a-z]{20}$/),
            }),
            name: "ichiro",
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: expect.stringMatching(/^[0-9a-z]{20}$/),
            }),
            name: "jiro",
          },
        ]);
      });

      test.fails("レコード ID でレコードを作成できない", async () => {
        // @ts-expect-error レコード ID を指定できない
        const record = await db.insert<{ name: string }>(new Thing("user", 1), {
          name: "tai-kun",
        });

        expectTypeOf<typeof record>().toEqualTypeOf<
          // @ts-expect-error オブジェクトが返ってくるはない
          { id: string | DataType.Thing } & {
            name: string;
          }
        >();

        expect(record).toStrictEqual({
          id: expect.objectContaining({
            table: "user",
            id: 1,
          }),
          name: "tai-kun",
        });
      });
    });

    describe("select", () => {
      beforeEach(async () => {
        await db.query("DEFINE TABLE user SCHEMALESS");
        await db.query(`
          CREATE user:1 SET name = "ichiro";
          CREATE user:2 SET name = "jiro";
        `);
      });

      afterEach(async () => {
        await db.query("REMOVE TABLE user");
      });

      test("テーブル名でレコードを取得する", async () => {
        const records = await db.select<{ name: string }>("user");
        records.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "ichiro",
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "jiro",
          },
        ]);
      });

      test("テーブルオブジェクトでレコードを取得する", async () => {
        const records = await db.select<{ name: string }>(new Table("user"));
        records.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "ichiro",
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "jiro",
          },
        ]);
      });

      test("レコード ID でレコードを取得する", async () => {
        const record = await db.select<{ name: string }>(new Thing("user", 1));

        expectTypeOf<typeof record>().toEqualTypeOf<
          { id: string | DataType.Thing } & {
            name: string;
          }
        >();

        expect(record).toStrictEqual({
          id: expect.objectContaining({
            table: "user",
            id: 1,
          }),
          name: "ichiro",
        });
      });
    });

    describe("update", () => {
      beforeEach(async () => {
        await db.query("DEFINE TABLE user SCHEMALESS");
        await db.query(`
          CREATE user:1 SET name = "ichiro";
          CREATE user:2 SET name = "jiro";
        `);
      });

      afterEach(async () => {
        await db.query("REMOVE TABLE user");
      });

      test("テーブル名で更新する", async () => {
        const records = await db.update<{ name: string }>("user", {
          name: "名無し",
        });
        records.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "名無し",
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "名無し",
          },
        ]);
      });

      test("テーブルオブジェクトで更新する", async () => {
        const records = await db.update<{ age: number }>(new Table("user"), {
          age: 42,
        });
        records.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            age: number;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            age: 42,
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            age: 42,
          },
        ]);
      });

      test("レコード ID で更新する", async () => {
        const record = await db.update(new Thing("user", 1), {});

        expectTypeOf<typeof record>().toEqualTypeOf<
          { id: string | DataType.Thing } & {
            [p: string]: unknown;
          }
        >();

        expect(record).toStrictEqual({
          id: expect.objectContaining({
            table: "user",
            id: 1,
          }),
        });
      });
    });

    describe("upsert", () => {
      beforeEach(async () => {
        await db.query("DEFINE TABLE user SCHEMALESS");
      });

      afterEach(async () => {
        await db.query("REMOVE TABLE user");
      });

      test("テーブル名でレコードを UPSERT する", async () => {
        const records = await db.upsert<{ name: string }>("user", {
          name: "ichiro",
        });

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          // Empty
        ]);
        await expect(db.query("SELECT * FROM user")).resolves.toStrictEqual([
          [/* Empty */],
        ]);
      });

      test("テーブルオブジェクトでレコードを UPSERT する", async () => {
        await db.query("CREATE user:1 SET name = 'ichiro'");

        const records = await db.upsert<{ name: string }>(new Table("user"), {
          name: "jiro",
        });

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "jiro",
          },
        ]);
      });

      test("レコード ID でレコードを UPSERT する", async () => {
        const record = await db.upsert<{ name: string }>(new Thing("user", 1), {
          name: "ichiro",
        });

        expectTypeOf<typeof record>().toEqualTypeOf<
          { id: string | DataType.Thing } & {
            name: string;
          }
        >();

        expect(record).toStrictEqual({
          id: expect.objectContaining({
            table: "user",
            id: 1,
          }),
          name: "ichiro",
        });
      });
    });

    describe("merge", () => {
      beforeEach(async () => {
        await db.query("DEFINE TABLE user SCHEMALESS");
        await db.query(`
          CREATE user:1 SET name = "ichiro";
          CREATE user:2 SET name = "jiro";
        `);
      });

      afterEach(async () => {
        await db.query("REMOVE TABLE user");
      });

      test("テーブル名でマージする", async () => {
        const records = await db.merge<
          { name: string; age: number },
          { age: number }
        >("user", {
          age: 42,
        });
        records.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
            age: number;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "ichiro",
            age: 42,
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "jiro",
            age: 42,
          },
        ]);
      });

      test("テーブルオブジェクトでマージする", async () => {
        const records = await db.merge<
          { name: string; age: number },
          { age: number }
        >(new Table("user"), {
          age: 42,
        });
        records.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
            age: number;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "ichiro",
            age: 42,
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "jiro",
            age: 42,
          },
        ]);
      });

      test("レコード ID でマージする", async () => {
        const record = await db.merge<
          { name: string; age: number },
          { age: number }
        >(new Thing("user", 1), {
          age: 42,
        });

        expectTypeOf<typeof record>().toEqualTypeOf<
          { id: string | DataType.Thing } & {
            name: string;
            age: number;
          }
        >();

        expect(record).toStrictEqual({
          id: expect.objectContaining({
            table: "user",
            id: 1,
          }),
          name: "ichiro",
          age: 42,
        });
      });
    });

    describe("patch", () => {
      beforeEach(async () => {
        await db.query("DEFINE TABLE user SCHEMALESS");
        await db.query(`
          CREATE user:1 SET name = "ichiro";
          CREATE user:2 SET name = "jiro";
        `);
      });

      afterEach(async () => {
        await db.query("REMOVE TABLE user");
      });

      test("テーブル名でパッチをあてる", async () => {
        const records = await db.patch<{
          age: number;
          [p: string]: unknown;
        }>("user", [{
          op: "add",
          path: "/age",
          value: 42,
        }]);
        records.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            age: number;
            [p: string]: unknown;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "ichiro",
            age: 42,
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "jiro",
            age: 42,
          },
        ]);
      });

      test("テーブルオブジェクトでパッチをあてる", async () => {
        const records = await db.patch<{
          age: number;
          [p: string]: unknown;
        }>(new Table("user"), [{
          op: "add",
          path: "/age",
          value: 42,
        }]);
        records.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            age: number;
            [p: string]: unknown;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "ichiro",
            age: 42,
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "jiro",
            age: 42,
          },
        ]);
      });

      test("レコード ID でパッチをあてる", async () => {
        const patches = await db.patch(new Thing("user", 1), [{
          op: "add",
          path: "/age",
          value: 42,
        }], {
          diff: true,
        });

        expectTypeOf<typeof patches>().toEqualTypeOf<Patch[]>();

        expect(patches).toStrictEqual([
          {
            op: "add",
            path: "/age",
            value: 42,
          },
        ]);
      });
    });

    describe("delete", () => {
      beforeEach(async () => {
        await db.query("DEFINE TABLE user SCHEMALESS");
        await db.query(`
          CREATE user:1 SET name = "ichiro";
          CREATE user:2 SET name = "jiro";
        `);
      });

      afterEach(async () => {
        await db.query("REMOVE TABLE user");
      });

      test("テーブル名でレコードを削除する", async () => {
        const records = await db.delete<{ name: string }>("user");

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "ichiro",
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "jiro",
          },
        ]);
        await expect(db.query("SELECT * FROM user")).resolves.toStrictEqual([
          [/* Empty */],
        ]);
      });

      test("テーブルオブジェクトでレコードを削除する", async () => {
        const records = await db.delete<{ name: string }>(new Table("user"));

        expectTypeOf<typeof records>().toEqualTypeOf<
          ({ id: string | DataType.Thing } & {
            name: string;
          })[]
        >();

        expect(records).toStrictEqual([
          {
            id: expect.objectContaining({
              table: "user",
              id: 1,
            }),
            name: "ichiro",
          },
          {
            id: expect.objectContaining({
              table: "user",
              id: 2,
            }),
            name: "jiro",
          },
        ]);
        await expect(db.query("SELECT * FROM user")).resolves.toStrictEqual([
          [/* Empty */],
        ]);
      });

      test("レコード ID でレコードを削除する", async () => {
        const record = await db.delete<{ name: string }>(new Thing("user", 1));

        expectTypeOf<typeof record>().toEqualTypeOf<
          { id: string | DataType.Thing } & {
            name: string;
          }
        >();

        expect(record).toStrictEqual({
          id: expect.objectContaining({
            table: "user",
            id: 1,
          }),
          name: "ichiro",
        });
        await expect(db.query("SELECT * FROM user")).resolves.toStrictEqual([
          [
            {
              id: expect.objectContaining({
                table: "user",
                id: 2,
              }),
              name: "jiro",
            },
          ],
        ]);
      });
    });

    describe.todo("relate");
  });
}
