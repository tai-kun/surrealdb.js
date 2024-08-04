import { Thing } from "@tai-kun/surrealdb";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

for (const { suite, fmt, url, Surreal, surql } of surreal) {
  describe.runIf(fmt === "cbor")(suite, () => {
    test("スロットに値を入れる", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });
      await db.use(suite, "slot");

      const UserIdSlot = surql.slot("id").type<Thing<"user">>();
      const UserAgeSlot = surql.slot("age", 42);

      const CreateUserQuery = surql`
        CREATE ONLY ${UserIdSlot} CONTENT {
          age: ${UserAgeSlot},
        };
      `.returns<[{ id: Thing<"user">; age: number }]>();

      const results = await db.query(CreateUserQuery, {
        id: new Thing("user", "tai-kun"),
      });

      expect(results).toStrictEqual([
        {
          id: new Thing("user", "tai-kun"),
          age: 42,
        },
      ]);
    });

    test("必須のスロットに値を入れなかったらエラー", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });
      await db.use(suite, "slot");

      const UserIdSlot = surql.slot("id").type<Thing<"user">>();
      const UserAgeSlot = surql.slot("age", 42);

      const CreateUserQuery = surql`
        CREATE ONLY ${UserIdSlot} CONTENT {
          age: ${UserAgeSlot},
        };
      `.returns<[{ id: Thing<"user">; age: number }]>();

      const query = async () => {
        // @ts-expect-error エラーが期待される。
        await db.query(CreateUserQuery);
      };
      await expect(query).rejects.toThrowError(SurrealTypeError);
    });

    test;
  });
}
