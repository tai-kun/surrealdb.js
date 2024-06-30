import { assertEquals, assertRejects } from "@tools/assert";
import { ENV, test } from "@tools/test";
import { timeoutSignal } from "surrealjs/_internal";

test("rpc を使える", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  const [queryResult] = await db.rpc("query", [/*surql*/ `RETURN 1`]);

  assertEquals(queryResult?.result, 1);
});

test("rpc のタイムアウトを設定できる", async () => {
  if (ENV === "Firefox") {
    // TODO(tai-kun): Firefox でエラー関連のテストに失敗する。要調査。
    return;
  }

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
