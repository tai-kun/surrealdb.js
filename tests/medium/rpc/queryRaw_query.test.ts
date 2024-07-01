import { QueryFailure, RpcResponseError } from "@tai-kun/surreal/errors";
import { Thing } from "@tai-kun/surreal/full";
import { assertDeepEquals, assertRejects } from "@tools/assert";
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
  describe([engine, formatter, validator].join("-"), {
    skip: !(formatter === "json"),
  }, () => {
    before(async () => {
      await surreal.ready;
    });

    test("クエリーを実行し、RPC のレスポンスをそのまま取得する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.use("my_namespace", "my_database");
      const results = await db.queryRaw(/*surql*/ `
        RETURN 42;
        RETURN fn::undefined_function();
      `);

      assertDeepEquals(results, [
        {
          status: "OK",
          time: results[0]?.time!,
          result: 42,
        },
        {
          status: "ERR",
          time: results[1]?.time!,
          result: "The function 'fn::undefined_function' does not exist",
        },
      ]);
    });

    test("無効なクエリーを実行するとレスポンスエラーが投げられる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);

      await assertRejects(
        async () => {
          await db.queryRaw(/*surql*/ `OUTPUT "OK"`);
        },
        RpcResponseError,
      );
    });

    test("クエリーの実行結果だけを取得する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.use("my_namespace", "my_database");
      const results = await db.query(/*surql*/ `RETURN $named_variable;`, {
        named_variable: 42,
      });

      assertDeepEquals(results, [42]);
    });

    test("クエリーの結果のうち 1 つでもエラーがある場合、エラーが投げられる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.use("my_namespace", "my_database");

      await assertRejects(
        async () => {
          await db.query(/*surql*/ `
            RETURN 42;
            RETURN fn::undefined_function();
          `);
        },
        QueryFailure,
      );
    });
  });

  describe([engine, formatter, validator].join("-"), {
    skip: !(formatter === "cbor"),
  }, () => {
    before(async () => {
      await surreal.ready;
    });

    test("クエリーを実行し、RPC のレスポンスをそのまま取得する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.use("my_namespace", "my_database");
      const results = await db.queryRaw(/*surql*/ `
        RETURN ${new Thing("tb-name", "record-id").toSurql()};
        RETURN fn::undefined_function();
      `);

      assertDeepEquals(results, [
        {
          status: "OK",
          time: results[0]?.time!,
          result: new Thing("tb-name", "record-id"),
        },
        {
          status: "ERR",
          time: results[1]?.time!,
          result: "The function 'fn::undefined_function' does not exist",
        },
      ]);
    });

    test("クエリーの実行結果だけを取得する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.use("my_namespace", "my_database");
      const results = await db.query(/*surql*/ `RETURN $named_variable;`, {
        named_variable: new Thing("tb-name", "record-id"),
      });

      assertDeepEquals(results, [new Thing("tb-name", "record-id")]);
    });
  });
}
