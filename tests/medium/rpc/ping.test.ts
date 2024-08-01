import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

for (const { suite, url, Surreal } of surreal) {
  describe(suite, () => {
    test("ping を送れる", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await expect(db.ping()).resolves.toBe(undefined);
    });
  });
}
