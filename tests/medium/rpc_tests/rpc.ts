import { timeoutSignal } from "@tai-kun/surrealdb/_internal";
import { assertEquals, assertRejects } from "@tools/assert";
import { test } from "@tools/test";

test("rpc を使える", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  const [queryResult] = await db.rpc("query", [/*surql*/ `RETURN 1`]);

  assertEquals(queryResult?.result, 1);
});

test("タイムアウトを設定できる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);

  await assertRejects(
    async () => {
      await db.rpc("query", [/*surql*/ `SLEEP 3s`], {
        signal: timeoutSignal(1_000),
      });
    },
    Error,
  );
});
