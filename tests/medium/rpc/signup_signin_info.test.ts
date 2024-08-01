import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

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

for (const { suite, url, Surreal } of surreal) {
  describe(suite, () => {
    test("ルートユーザーでサインインする", async () => {
      await using db = new Surreal();
      await db.connect(url());
      const token = await db.signin({ user: "root", pass: "root" });

      expect(token).toMatch(JWT_REGEX);
      expect(db.getConnectionInfo()).toMatchObject({ token });
    });

    test("名前空間ユーザーでサインインする", async () => {
      await using db = new Surreal();
      await db.connect(url());

      try {
        // 名前空間ユーザーを作成する。
        {
          await db.use("my_namespace");
          await db.signin({ user: "root", pass: "root" });
          await db.query(/*surql*/ `
            DEFINE USER ns_user ON NAMESPACE PASSWORD "passw0rd";
          `);
        }

        const token = await db.signin({
          ns: "my_namespace",
          user: "ns_user",
          pass: "passw0rd",
        });

        expect(token).toMatch(JWT_REGEX);
        expect(db.getConnectionInfo()).toMatchObject({ token });
      } finally {
        // クリーンアップ
        await db.signin({ user: "root", pass: "root" });
        await db.query(/*surql*/ `
          REMOVE USER ns_user ON NAMESPACE;
        `);
      }
    });

    test("データベースユーザーでサインインする", async () => {
      await using db = new Surreal();
      await db.connect(url());

      try {
        // データベースユーザーを作成する。
        {
          await db.use("my_namespace", "my_database");
          await db.signin({ user: "root", pass: "root" });
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

        expect(token).toMatch(JWT_REGEX);
        expect(db.getConnectionInfo()).toMatchObject({ token });
      } finally {
        // クリーンアップ
        await db.signin({ user: "root", pass: "root" });
        await db.query(/*surql*/ `
          REMOVE USER db_user ON DATABASE;
        `);
      }
    });

    test(
      "レコードアクセスでサインアップ・サインインする",
      async () => {
        await using db = new Surreal();
        await db.connect(url());

        try {
          // レコードアクセスを作成する。
          {
            await db.use("my_namespace", "my_database");
            await db.signin({ user: "root", pass: "root" });
            await db.query(/*surql*/ `
              DEFINE ACCESS account ON DATABASE TYPE RECORD
                SIGNUP ( CREATE type::thing("user", $id) SET email = $email, pass = crypto::argon2::generate($pass) )
                SIGNIN ( SELECT * FROM type::thing("user", $id) WHERE crypto::argon2::compare(pass, $pass) );
            `);
          }

          // サインアップ
          {
            const token = await db.signup({
              ns: "my_namespace",
              db: "my_database",
              ac: "account",
              id: "tai-kun",
              email: "tai-kun@example.com",
              pass: "passw0rd",
            });

            expect(token).toMatch(JWT_REGEX);
            expect(db.getConnectionInfo()).toMatchObject({ token });
          }

          // サインイン
          {
            const token = await db.signin({
              ns: "my_namespace",
              db: "my_database",
              ac: "account",
              id: "tai-kun",
              pass: "passw0rd",
            });

            expect(token).toMatch(JWT_REGEX);
            expect(db.getConnectionInfo()).toMatchObject({ token });
          }

          // 資格情報
          // TODO(tai-kun): なんか失敗する
          // {
          //   await expect(db.info()).resolves.toMatchObject({
          //     email: "tai-kun@example.com",
          //   });
          // }
        } finally {
          // クリーンアップ
          await db.signin({ user: "root", pass: "root" });
          await db.query(/*surql*/ `
            REMOVE ACCESS account ON DATABASE;
            REMOVE TABLE user;
          `);
        }
      },
    );
  });
}
