import { decode, encode } from "@tai-kun/surrealdb/cbor";
import { toSurql } from "@tai-kun/surrealdb/utils";
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

const UUID_36_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

for (const { suite, url, Surreal } of surreal) {
  describe(suite, () => {
    test("ルートユーザーでサインインする", async () => {
      await using db = new Surreal();
      await db.connect(url());
      const jwt = await db.signin({ user: "root", pass: "root" });

      expect.soft(jwt.raw).toMatch(JWT_REGEX);

      expect.soft(jwt.header).toStrictEqual({
        typ: "JWT",
        alg: "HS512",
      });

      expect.soft(jwt.payload.iss).toBe("SurrealDB");
      expect.soft(jwt.payload.jti).toMatch(UUID_36_REGEX);
      expect.soft(jwt.payload.iat).toBeTypeOf("number");
      expect.soft(jwt.payload.nbf).toBeTypeOf("number");
      expect.soft(jwt.payload.exp).toBeTypeOf("number");
      expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
      expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
      expect.soft(jwt.payload.NS).toBe(undefined);
      expect.soft(jwt.payload.DB).toBe(undefined);
      expect.soft(jwt.payload.AC).toBe(undefined);
      expect.soft(jwt.payload.ID).toBe("root");

      expect.soft(jwt.issuer).toBe("SurrealDB");
      expect.soft(jwt.id).toBe(jwt.payload.jti);
      expect.soft(jwt.issuedAt).toBe(jwt.payload.iat);
      expect.soft(jwt.notBefore).toBe(jwt.payload.nbf);
      expect.soft(jwt.expiresAt).toBe(jwt.payload.exp);
      expect.soft(jwt.namespace).toBe(undefined);
      expect.soft(jwt.database).toBe(undefined);
      expect.soft(jwt.access).toBe(undefined);
      expect.soft(jwt.user).toBe("root");

      expect.soft(`${jwt}`).toBe("[REDACTED]");
      expect.soft(decode(encode(jwt))).toBe("[REDACTED]");
      expect.soft(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
      expect.soft(toSurql(jwt)).toBe(`'[REDACTED]'`);

      expect.soft(db.getConnectionInfo()).toStrictEqual({
        state: "open",
        endpoint: new URL(`${url()}/rpc`),
        namespace: null,
        database: null,
        token: jwt.raw,
      });
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

        const jwt = await db.signin({
          ns: "my_namespace",
          user: "ns_user",
          pass: "passw0rd",
        });

        expect.soft(jwt.header).toStrictEqual({
          typ: "JWT",
          alg: "HS512",
        });

        expect.soft(jwt.payload.iss).toBe("SurrealDB");
        expect.soft(jwt.payload.jti).toMatch(UUID_36_REGEX);
        expect.soft(jwt.payload.iat).toBeTypeOf("number");
        expect.soft(jwt.payload.nbf).toBeTypeOf("number");
        expect.soft(jwt.payload.exp).toBeTypeOf("number");
        expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
        expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
        expect.soft(jwt.payload.NS).toBe("my_namespace");
        expect.soft(jwt.payload.DB).toBe(undefined);
        expect.soft(jwt.payload.AC).toBe(undefined);
        expect.soft(jwt.payload.ID).toBe("ns_user");

        expect.soft(jwt.issuer).toBe("SurrealDB");
        expect.soft(jwt.id).toBe(jwt.payload.jti);
        expect.soft(jwt.issuedAt).toBe(jwt.payload.iat);
        expect.soft(jwt.notBefore).toBe(jwt.payload.nbf);
        expect.soft(jwt.expiresAt).toBe(jwt.payload.exp);
        expect.soft(jwt.namespace).toBe("my_namespace");
        expect.soft(jwt.database).toBe(undefined);
        expect.soft(jwt.access).toBe(undefined);
        expect.soft(jwt.user).toBe("ns_user");

        expect.soft(`${jwt}`).toBe("[REDACTED]");
        expect.soft(decode(encode(jwt))).toBe("[REDACTED]");
        expect.soft(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
        expect.soft(toSurql(jwt)).toBe(`'[REDACTED]'`);

        expect.soft(db.getConnectionInfo()).toStrictEqual({
          state: "open",
          endpoint: new URL(`${url()}/rpc`),
          namespace: "my_namespace",
          database: null,
          token: jwt.raw,
        });
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

        const jwt = await db.signin({
          ns: "my_namespace",
          db: "my_database",
          user: "db_user",
          pass: "passw0rd",
        });

        expect.soft(jwt.header).toStrictEqual({
          typ: "JWT",
          alg: "HS512",
        });

        expect.soft(jwt.payload.iss).toBe("SurrealDB");
        expect.soft(jwt.payload.jti).toMatch(UUID_36_REGEX);
        expect.soft(jwt.payload.iat).toBeTypeOf("number");
        expect.soft(jwt.payload.nbf).toBeTypeOf("number");
        expect.soft(jwt.payload.exp).toBeTypeOf("number");
        expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
        expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
        expect.soft(jwt.payload.NS).toBe("my_namespace");
        expect.soft(jwt.payload.DB).toBe("my_database");
        expect.soft(jwt.payload.AC).toBe(undefined);
        expect.soft(jwt.payload.ID).toBe("db_user");

        expect.soft(jwt.issuer).toBe("SurrealDB");
        expect.soft(jwt.id).toBe(jwt.payload.jti);
        expect.soft(jwt.issuedAt).toBe(jwt.payload.iat);
        expect.soft(jwt.notBefore).toBe(jwt.payload.nbf);
        expect.soft(jwt.expiresAt).toBe(jwt.payload.exp);
        expect.soft(jwt.namespace).toBe("my_namespace");
        expect.soft(jwt.database).toBe("my_database");
        expect.soft(jwt.access).toBe(undefined);
        expect.soft(jwt.user).toBe("db_user");

        expect.soft(`${jwt}`).toBe("[REDACTED]");
        expect.soft(decode(encode(jwt))).toBe("[REDACTED]");
        expect.soft(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
        expect.soft(toSurql(jwt)).toBe(`'[REDACTED]'`);

        expect.soft(db.getConnectionInfo()).toStrictEqual({
          state: "open",
          endpoint: new URL(`${url()}/rpc`),
          namespace: "my_namespace",
          database: "my_database",
          token: jwt.raw,
        });
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
              DEFINE TABLE user SCHEMAFULL;
              DEFINE FIELD email ON TABLE user;
              DEFINE FIELD pass ON TABLE user;
              DEFINE ACCESS account ON DATABASE TYPE RECORD
                SIGNUP ( CREATE type::thing("user", $id) SET email = $email, pass = crypto::argon2::generate($pass) )
                SIGNIN ( SELECT * FROM type::thing("user", $id) WHERE crypto::argon2::compare(pass, $pass) );
            `);
          }

          // サインアップ
          {
            const jwt = await db.signup({
              ns: "my_namespace",
              db: "my_database",
              ac: "account",
              id: "tai-kun",
              email: "tai-kun@example.com",
              pass: "passw0rd",
            });

            expect.soft(jwt.header).toStrictEqual({
              typ: "JWT",
              alg: "HS512",
            });

            expect.soft(jwt.payload.iss).toBe("SurrealDB");
            expect.soft(jwt.payload.jti).toMatch(UUID_36_REGEX);
            expect.soft(jwt.payload.iat).toBeTypeOf("number");
            expect.soft(jwt.payload.nbf).toBeTypeOf("number");
            expect.soft(jwt.payload.exp).toBeTypeOf("number");
            expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
            expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
            expect.soft(jwt.payload.NS).toBe("my_namespace");
            expect.soft(jwt.payload.DB).toBe("my_database");
            expect.soft(jwt.payload.AC).toBe("account");
            expect.soft(jwt.payload.ID).toBe("user:⟨tai-kun⟩");

            expect.soft(jwt.issuer).toBe("SurrealDB");
            expect.soft(jwt.id).toBe(jwt.payload.jti);
            expect.soft(jwt.issuedAt).toBe(jwt.payload.iat);
            expect.soft(jwt.notBefore).toBe(jwt.payload.nbf);
            expect.soft(jwt.expiresAt).toBe(jwt.payload.exp);
            expect.soft(jwt.namespace).toBe("my_namespace");
            expect.soft(jwt.database).toBe("my_database");
            expect.soft(jwt.access).toBe("account");
            expect.soft(jwt.user).toBe("user:⟨tai-kun⟩");

            expect.soft(`${jwt}`).toBe("[REDACTED]");
            expect.soft(decode(encode(jwt))).toBe("[REDACTED]");
            expect.soft(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
            expect.soft(toSurql(jwt)).toBe(`'[REDACTED]'`);

            expect.soft(db.getConnectionInfo()).toStrictEqual({
              state: "open",
              endpoint: new URL(`${url()}/rpc`),
              namespace: "my_namespace",
              database: "my_database",
              token: jwt.raw,
            });
          }

          // サインイン
          {
            const jwt = await db.signin({
              ns: "my_namespace",
              db: "my_database",
              ac: "account",
              id: "tai-kun",
              pass: "passw0rd",
            });

            expect.soft(jwt.header).toStrictEqual({
              typ: "JWT",
              alg: "HS512",
            });

            expect.soft(jwt.payload.iss).toBe("SurrealDB");
            expect.soft(jwt.payload.jti).toMatch(UUID_36_REGEX);
            expect.soft(jwt.payload.iat).toBeTypeOf("number");
            expect.soft(jwt.payload.nbf).toBeTypeOf("number");
            expect.soft(jwt.payload.exp).toBeTypeOf("number");
            expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
            expect.soft(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
            expect.soft(jwt.payload.NS).toBe("my_namespace");
            expect.soft(jwt.payload.DB).toBe("my_database");
            expect.soft(jwt.payload.AC).toBe("account");
            expect.soft(jwt.payload.ID).toBe("user:⟨tai-kun⟩");

            expect.soft(jwt.issuer).toBe("SurrealDB");
            expect.soft(jwt.id).toBe(jwt.payload.jti);
            expect.soft(jwt.issuedAt).toBe(jwt.payload.iat);
            expect.soft(jwt.notBefore).toBe(jwt.payload.nbf);
            expect.soft(jwt.expiresAt).toBe(jwt.payload.exp);
            expect.soft(jwt.namespace).toBe("my_namespace");
            expect.soft(jwt.database).toBe("my_database");
            expect.soft(jwt.access).toBe("account");
            expect.soft(jwt.user).toBe("user:⟨tai-kun⟩");

            expect.soft(`${jwt}`).toBe("[REDACTED]");
            expect.soft(decode(encode(jwt))).toBe("[REDACTED]");
            expect.soft(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
            expect.soft(toSurql(jwt)).toBe(`'[REDACTED]'`);

            expect.soft(db.getConnectionInfo()).toStrictEqual({
              state: "open",
              endpoint: new URL(`${url()}/rpc`),
              namespace: "my_namespace",
              database: "my_database",
              token: jwt.raw,
            });
          }

          // 資格情報
          // TODO(tai-kun): なんか失敗する
          // https://github.com/surrealdb/surrealdb/issues/4489
          {
            // なぜか何もない。
            await expect.soft(db.info()).resolves.toBeFalsy();
            await expect.soft(db.query("SELECT * FROM $auth"))
              .resolves
              .toStrictEqual([
                [
                  // 何もない...
                ],
              ]);
            // 本来は ↓ のテストが通るはず。
            // await expect.soft(db.info()).resolves.toMatchObject({
            //   email: "tai-kun@example.com",
            // });

            // 一応テーブルの状況を確認してみる。
            {
              // $auth は正常
              await expect.soft(db.query("RETURN $auth"))
                .resolves
                .toStrictEqual([
                  expect.anything(), // 1 つのレコード ID
                ]);

              // user テーブルにレコードが作成されている。
              await db.signin({ user: "root", pass: "root" });
              await expect.soft(db.query("SELECT * FROM user"))
                .resolves
                .toStrictEqual([
                  [
                    expect.objectContaining({
                      email: "tai-kun@example.com",
                    }),
                  ],
                ]);
            }
          }
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
