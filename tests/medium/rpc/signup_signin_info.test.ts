import assert from "@tools/assert";
import { beforeAll, describe, test } from "@tools/test";
import surreal from "../surreal.js";

for (const { suiteName, initSurreal } of surreal) {
  describe(suiteName, () => {
    beforeAll(async () => {
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

      assert.match(token, JWT_REGEX);
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

      assert.match(token, JWT_REGEX);
      assert.equal(db.getConnectionInfo()?.token, token);

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

      assert.match(token, JWT_REGEX);
      assert.equal(db.getConnectionInfo()?.token, token);

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

        assert.match(token, JWT_REGEX);
        assert.equal(db.getConnectionInfo()?.token, token);
      }

      // サインイン
      {
        const token = await db.signin({
          ns: "my_namespace",
          db: "my_database",
          sc: "app_user",
          id: "tai-kun",
        });

        assert.match(token, JWT_REGEX);
        assert.equal(db.getConnectionInfo()?.token, token);
      }

      // 資格情報
      {
        const { id, ...info } = await db.info();

        if (typeof id === "string") {
          assert.equal(id, "app_user:⟨tai-kun⟩");
        } else {
          assert.equal(id.tb, "app_user");
          assert.equal(id.id, "tai-kun");
        }

        assert.deepEqual(info, {
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
