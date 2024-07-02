import { assertDeepEquals, assertEquals, assertMatch } from "@tools/assert";
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
  describe([engine, formatter, validator].join("-"), () => {
    before(async () => {
      await surreal.ready;
    });

    const BASE64URL_REGEX = /([0-9a-zA-Z_-]{4})*([0-9a-zA-Z_-]{2,3})?/;

    const JWT_REGEX = new RegExp([
      "^",
      BASE64URL_REGEX.source,
      "\\.",
      BASE64URL_REGEX.source,
      "\\.",
      BASE64URL_REGEX.source,
      "$",
    ].join(""));

    test("ルートユーザーでサインインする", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      const token = await db.signin({
        user: "root",
        pass: "root",
      });

      assertMatch(token, JWT_REGEX);
    });

    test("名前空間ユーザーでサインインする", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);

      // 名前空間ユーザーを作成する。
      {
        await db.use("my_namespace");
        await db.query(/*surql*/ `
          DEFINE USER ns_user ON NAMESPACE PASSWORD "passw0rd";
        `);
      }

      const token = await db.signin({
        ns: "my_namespace",
        user: "ns_user",
        pass: "passw0rd",
      });

      assertMatch(token, JWT_REGEX);
      assertEquals(db.getConnectionInfo()?.token, token);

      // クリーンアップ
      {
        await db.signin({
          user: "root",
          pass: "root",
        });
        await db.query(/*surql*/ `
          REMOVE USER ns_user ON NAMESPACE;
        `);
      }
    });

    test("データベースユーザーでサインインする", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);

      // データベースユーザーを作成する。
      {
        await db.use("my_namespace", "my_database");
        await db.query(/*surql*/ `
          DEFINE USER db_user ON DATABASE PASSWORD "passw0rd";
        `);
      }

      const token = await db.signin({
        ns: "my_namespace",
        db: "my_database",
        user: "db_user",
        pass: "passw0rd",
      });

      assertMatch(token, JWT_REGEX);
      assertEquals(db.getConnectionInfo()?.token, token);

      // クリーンアップ
      {
        await db.signin({
          user: "root",
          pass: "root",
        });
        await db.query(/*surql*/ `
          REMOVE USER db_user ON DATABASE;
        `);
      }
    });

    test("スコープユーザーでサインアップ・サインインする", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);

      // スコープユーザーを作成する。
      {
        await db.use("my_namespace", "my_database");
        await db.query(/*surql*/ `
          DEFINE TABLE app_user PERMISSIONS FOR SELECT WHERE id == $auth.id;
          DEFINE SCOPE app_user
            SIGNUP ( CREATE type::thing("app_user", $id) SET foo = $foo )
            SIGNIN ( SELECT * FROM type::thing("app_user", $id) );
        `);
      }

      // サインアップ
      {
        const token = await db.signup({
          ns: "my_namespace",
          db: "my_database",
          sc: "app_user",
          id: "tai-kun",
          foo: "bar",
        });

        assertMatch(token, JWT_REGEX);
        assertEquals(db.getConnectionInfo()?.token, token);
      }

      // サインイン
      {
        const token = await db.signin({
          ns: "my_namespace",
          db: "my_database",
          sc: "app_user",
          id: "tai-kun",
        });

        assertMatch(token, JWT_REGEX);
        assertEquals(db.getConnectionInfo()?.token, token);
      }

      // 資格情報
      {
        const { id, ...info } = await db.info();

        if (typeof id === "string") {
          assertEquals(id, "app_user:⟨tai-kun⟩");
        } else {
          assertEquals(id.tb, "app_user");
          assertEquals(id.id, "tai-kun");
        }

        assertDeepEquals(info, {
          foo: "bar",
        });
      }

      // クリーンアップ
      {
        await db.signin({
          user: "root",
          pass: "root",
        });
        await db.query(/*surql*/ `
          REMOVE SCOPE app_user;
          REMOVE TABLE app_user;
        `);
      }
    });
  });
}
