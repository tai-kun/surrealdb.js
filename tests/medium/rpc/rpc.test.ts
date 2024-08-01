import { getTimeoutSignal } from "@tai-kun/surrealdb/utils";
import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

for (const { suite, url, Surreal } of surreal) {
  describe(suite, () => {
    test("rpc が使える", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      const [queryResult] = await db.rpc("query", [/*surql*/ `RETURN 1`]);

      expect(queryResult?.result).toBe(1);
    });

    test("rpc のタイムアウトを設定できる", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await expect(
        db.rpc("query", [/*surql*/ `SLEEP 3s`], {
          signal: getTimeoutSignal(1_000),
        }),
      )
        .rejects
        .toThrowError(DOMException);
    });
  });
}
