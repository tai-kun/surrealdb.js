import { assertEquals } from "@pkg/assert";
import { test } from "@pkg/test";
import { OPEN } from "@tai-kun/surrealdb/engines";

test("接続できる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);

  assertEquals(db.state, OPEN);
});
