import { afterEach, beforeEach, describe, expect, test } from "vitest";
import surreal from "../surreal.js";

for (const { suite, fmt, url, Surreal } of surreal) {
  describe.runIf(fmt === "json")(suite, () => {
    let db: InstanceType<typeof Surreal>;

    beforeEach(async () => {
      db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });
      await db.use({ namespace: suite });
    });

    afterEach(async () => {
      await db.close();
    });

    test("実行できる", async () => {
      await db.use({ database: "execute" });
      await db.query(/*surql*/ `
        DEFINE CONFIG GRAPHQL AUTO;
        DEFINE TABLE person SCHEMAFULL;
        DEFINE FIELD name ON TABLE person TYPE string;
        CREATE person:1 SET name = "ichiro";
      `);
      const query = JSON.stringify({
        query: `{
          person {
            id
            name
          }
        }`,
      });
      const result = await db.graphql(query, {
        format: "json",
      });

      expect(result).toBe(JSON.stringify({
        data: {
          person: [
            {
              id: "person:1",
              name: "ichiro",
            },
          ],
        },
      }));
    });
  });

  describe.runIf(fmt === "cbor")(suite, () => {
    let db: InstanceType<typeof Surreal>;

    beforeEach(async () => {
      db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });
      await db.use({ namespace: suite });
    });

    afterEach(async () => {
      await db.close();
    });

    // CBOR に対応したらこのテストが失敗するので気付ける。
    test.fails("実行できない", async () => {
      await db.use({ database: "execute" });
      await db.query(/*surql*/ `
        DEFINE CONFIG GRAPHQL AUTO;
        DEFINE TABLE person SCHEMAFULL;
        DEFINE FIELD name ON TABLE person TYPE string;
        CREATE person:1 SET name = "ichiro";
      `);
      const query = JSON.stringify({
        query: `{
          person {
            id
            name
          }
        }`,
      });
      const result = await db.graphql(query, {
        format: "cbor" as any,
      });

      expect(result).toBe(JSON.stringify({
        data: {
          person: [
            {
              id: "person:1",
              name: "ichiro",
            },
          ],
        },
      }));
    });
  });
}
