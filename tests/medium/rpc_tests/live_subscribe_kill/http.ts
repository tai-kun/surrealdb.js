import { assertRejects } from "@tools/assert";
import { test } from "@tools/test";

test("HTTP プロトコルではライブクエリーがサポートされていない", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  await db.use("my_namespace", "my_database");

  await assertRejects(async () => {
    await db.live("person");
  });
});
