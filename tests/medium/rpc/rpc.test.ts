import { getTimeoutSignal } from "@tai-kun/surrealdb/utils";
import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

for (const { suite, fmt, url, Surreal } of surreal) {
  describe.runIf(fmt === "json")(suite, () => {
    test("rpc が使える", async () => {
      await using db = new Surreal();
      await db.connect(url());

      await expect(db.rpc("ping", [])).resolves.toBe(null);
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

    test("接続完了前に rpc を実行すると接続完了まで待機する", async () => {
      await using db = new Surreal();
      const pingPromise = db.rpc("ping", []);
      await db.connect(url());

      await expect(pingPromise).resolves.toBe(null);
    });
  });
}
