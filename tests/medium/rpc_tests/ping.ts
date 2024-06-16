import { test } from "@tools/test";

test("ping を送信できる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  await db.ping();
});
