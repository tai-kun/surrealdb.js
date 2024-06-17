import { Thing } from "@tai-kun/surrealdb/full";
import { assertDeepEquals } from "@tools/assert";
import { test } from "@tools/test";

test("クエリーを実行し、RPC のレスポンスをそのまま取得する", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
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
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  await db.use("my_namespace", "my_database");
  const results = await db.query(/*surql*/ `RETURN $named_variable;`, {
    named_variable: new Thing("tb-name", "record-id"),
  });

  assertDeepEquals(results, [new Thing("tb-name", "record-id")]);
});
