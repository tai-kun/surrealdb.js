import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

const TIME_REGEX = /^\d+(\.\d+)?\D+$/; // e.g. 26.536µs

for (const { suite, url, Surreal } of surreal) {
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
      }
    });

    test("特定の名前空間とデータベースに切り替える。", async () => {
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
      }
    });
  });
}
