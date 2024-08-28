import { RpcResponseError } from "@tai-kun/surrealdb/errors";
import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

for (const { suite, url, Surreal } of surreal) {
  describe(suite, () => {
    test(".authenticate() でユーザー認証", async () => {
      await using db = new Surreal();
      await db.connect(url());
      const token = await db.signin({ user: "root", pass: "root" });

      await expect(db.authenticate(token)).resolves.toBe(undefined);
    });

    test(".invalidate() でセッションを無効化", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await expect(db.query("RETURN 0")).resolves.toStrictEqual([0]);

      await db.invalidate(); // 無効化 !

      await expect(db.query("RETURN 0")).rejects.toThrowError(RpcResponseError);
    });
  });
}
