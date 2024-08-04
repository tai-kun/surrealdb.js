import { decode, encode } from "@tai-kun/surrealdb/cbor";
import { OPEN } from "@tai-kun/surrealdb/engine";
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

      expect(jwt.raw).toMatch(JWT_REGEX);

      expect(jwt.header).toStrictEqual({
        typ: "JWT",
        alg: "HS512",
      });

      expect(jwt.payload.iss).toBe("SurrealDB");
      expect(jwt.payload.jti).toMatch(UUID_36_REGEX);
      expect(jwt.payload.iat).toBeTypeOf("number");
      expect(jwt.payload.nbf).toBeTypeOf("number");
      expect(jwt.payload.exp).toBeTypeOf("number");
      expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
      expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
      expect(jwt.payload.NS).toBe(undefined);
      expect(jwt.payload.DB).toBe(undefined);
      expect(jwt.payload.AC).toBe(undefined);
      expect(jwt.payload.ID).toBe("root");

      expect(jwt.issuer).toBe("SurrealDB");
      expect(jwt.id).toBe(jwt.payload.jti);
      expect(jwt.issuedAt).toBe(jwt.payload.iat);
      expect(jwt.notBefore).toBe(jwt.payload.nbf);
      expect(jwt.expiresAt).toBe(jwt.payload.exp);
      expect(jwt.namespace).toBe(undefined);
      expect(jwt.database).toBe(undefined);
      expect(jwt.access).toBe(undefined);
      expect(jwt.user).toBe("root");

      expect(`${jwt}`).toBe("[REDACTED]");
      expect(decode(encode(jwt))).toBe("[REDACTED]");
      expect(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
      expect(toSurql(jwt)).toBe(`'[REDACTED]'`);

      expect(db.getConnectionInfo()).toStrictEqual({
        state: OPEN,
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

        expect(jwt.header).toStrictEqual({
          typ: "JWT",
          alg: "HS512",
        });

        expect(jwt.payload.iss).toBe("SurrealDB");
        expect(jwt.payload.jti).toMatch(UUID_36_REGEX);
        expect(jwt.payload.iat).toBeTypeOf("number");
        expect(jwt.payload.nbf).toBeTypeOf("number");
        expect(jwt.payload.exp).toBeTypeOf("number");
        expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
        expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
        expect(jwt.payload.NS).toBe("my_namespace");
        expect(jwt.payload.DB).toBe(undefined);
        expect(jwt.payload.AC).toBe(undefined);
        expect(jwt.payload.ID).toBe("ns_user");

        expect(jwt.issuer).toBe("SurrealDB");
        expect(jwt.id).toBe(jwt.payload.jti);
        expect(jwt.issuedAt).toBe(jwt.payload.iat);
        expect(jwt.notBefore).toBe(jwt.payload.nbf);
        expect(jwt.expiresAt).toBe(jwt.payload.exp);
        expect(jwt.namespace).toBe("my_namespace");
        expect(jwt.database).toBe(undefined);
        expect(jwt.access).toBe(undefined);
        expect(jwt.user).toBe("ns_user");

        expect(`${jwt}`).toBe("[REDACTED]");
        expect(decode(encode(jwt))).toBe("[REDACTED]");
        expect(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
        expect(toSurql(jwt)).toBe(`'[REDACTED]'`);

        expect(db.getConnectionInfo()).toStrictEqual({
          state: OPEN,
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

        expect(jwt.header).toStrictEqual({
          typ: "JWT",
          alg: "HS512",
        });

        expect(jwt.payload.iss).toBe("SurrealDB");
        expect(jwt.payload.jti).toMatch(UUID_36_REGEX);
        expect(jwt.payload.iat).toBeTypeOf("number");
        expect(jwt.payload.nbf).toBeTypeOf("number");
        expect(jwt.payload.exp).toBeTypeOf("number");
        expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
        expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
        expect(jwt.payload.NS).toBe("my_namespace");
        expect(jwt.payload.DB).toBe("my_database");
        expect(jwt.payload.AC).toBe(undefined);
        expect(jwt.payload.ID).toBe("db_user");

        expect(jwt.issuer).toBe("SurrealDB");
        expect(jwt.id).toBe(jwt.payload.jti);
        expect(jwt.issuedAt).toBe(jwt.payload.iat);
        expect(jwt.notBefore).toBe(jwt.payload.nbf);
        expect(jwt.expiresAt).toBe(jwt.payload.exp);
        expect(jwt.namespace).toBe("my_namespace");
        expect(jwt.database).toBe("my_database");
        expect(jwt.access).toBe(undefined);
        expect(jwt.user).toBe("db_user");

        expect(`${jwt}`).toBe("[REDACTED]");
        expect(decode(encode(jwt))).toBe("[REDACTED]");
        expect(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
        expect(toSurql(jwt)).toBe(`'[REDACTED]'`);

        expect(db.getConnectionInfo()).toStrictEqual({
          state: OPEN,
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

            expect(jwt.header).toStrictEqual({
              typ: "JWT",
              alg: "HS512",
            });

            expect(jwt.payload.iss).toBe("SurrealDB");
            expect(jwt.payload.jti).toMatch(UUID_36_REGEX);
            expect(jwt.payload.iat).toBeTypeOf("number");
            expect(jwt.payload.nbf).toBeTypeOf("number");
            expect(jwt.payload.exp).toBeTypeOf("number");
            expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
            expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
            expect(jwt.payload.NS).toBe("my_namespace");
            expect(jwt.payload.DB).toBe("my_database");
            expect(jwt.payload.AC).toBe("account");
            expect(jwt.payload.ID).toBe("user:⟨tai-kun⟩");

            expect(jwt.issuer).toBe("SurrealDB");
            expect(jwt.id).toBe(jwt.payload.jti);
            expect(jwt.issuedAt).toBe(jwt.payload.iat);
            expect(jwt.notBefore).toBe(jwt.payload.nbf);
            expect(jwt.expiresAt).toBe(jwt.payload.exp);
            expect(jwt.namespace).toBe("my_namespace");
            expect(jwt.database).toBe("my_database");
            expect(jwt.access).toBe("account");
            expect(jwt.user).toBe("user:⟨tai-kun⟩");

            expect(`${jwt}`).toBe("[REDACTED]");
            expect(decode(encode(jwt))).toBe("[REDACTED]");
            expect(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
            expect(toSurql(jwt)).toBe(`'[REDACTED]'`);

            expect(db.getConnectionInfo()).toStrictEqual({
              state: OPEN,
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

            expect(jwt.header).toStrictEqual({
              typ: "JWT",
              alg: "HS512",
            });

            expect(jwt.payload.iss).toBe("SurrealDB");
            expect(jwt.payload.jti).toMatch(UUID_36_REGEX);
            expect(jwt.payload.iat).toBeTypeOf("number");
            expect(jwt.payload.nbf).toBeTypeOf("number");
            expect(jwt.payload.exp).toBeTypeOf("number");
            expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.iat);
            expect(jwt.payload.exp).toBeGreaterThan(jwt.payload.nbf);
            expect(jwt.payload.NS).toBe("my_namespace");
            expect(jwt.payload.DB).toBe("my_database");
            expect(jwt.payload.AC).toBe("account");
            expect(jwt.payload.ID).toBe("user:⟨tai-kun⟩");

            expect(jwt.issuer).toBe("SurrealDB");
            expect(jwt.id).toBe(jwt.payload.jti);
            expect(jwt.issuedAt).toBe(jwt.payload.iat);
            expect(jwt.notBefore).toBe(jwt.payload.nbf);
            expect(jwt.expiresAt).toBe(jwt.payload.exp);
            expect(jwt.namespace).toBe("my_namespace");
            expect(jwt.database).toBe("my_database");
            expect(jwt.access).toBe("account");
            expect(jwt.user).toBe("user:⟨tai-kun⟩");

            expect(`${jwt}`).toBe("[REDACTED]");
            expect(decode(encode(jwt))).toBe("[REDACTED]");
            expect(JSON.stringify(jwt)).toBe(`"[REDACTED]"`);
            expect(toSurql(jwt)).toBe(`'[REDACTED]'`);

            expect(db.getConnectionInfo()).toStrictEqual({
              state: OPEN,
              endpoint: new URL(`${url()}/rpc`),
              namespace: "my_namespace",
              database: "my_database",
              token: jwt.raw,
            });
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
