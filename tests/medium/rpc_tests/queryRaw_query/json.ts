import { QueryFailure, RpcResponseError } from "@tai-kun/surrealdb/errors";
import { assertDeepEquals, assertRejects } from "@tools/assert";
import { test } from "@tools/test";

test("クエリーを実行し、RPC のレスポンスをそのまま取得する", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
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
  const { endpoint, Surreal } = await getInitializedSurreal();
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
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  await db.use("my_namespace", "my_database");
  const results = await db.query(/*surql*/ `RETURN $named_variable;`, {
    named_variable: 42,
  });

  assertDeepEquals(results, [42]);
});

test("クエリーの結果のうち 1 つでもエラーがある場合、エラーが投げられる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
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
