import { beforeAll, describe, test } from "@tools/test";
import surreal from "../surreal.js";

for (const { suiteName, initSurreal } of surreal) {
  describe(suiteName, () => {
    beforeAll(async () => {
      await surreal.ready;
    });

    test("ping メッセージを送信できる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.ping();
    });
  });
}
