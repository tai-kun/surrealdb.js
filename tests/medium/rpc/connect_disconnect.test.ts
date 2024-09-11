import { describe, expect, test, vi } from "vitest";
import surreal from "../surreal";

for (const { suite, Surreal, url } of surreal) {
  describe(suite, () => {
    test("接続できる", async () => {
      await using db = new Surreal();
      await db.connect(url());

      expect(db.state).toBe("open");
      expect(db.endpoint?.toString()).toBe(`${url()}/rpc`);
    });

    test("同じエンドポイントであれば連続して接続できる", async () => {
      await using db = new Surreal();
      await Promise.all([
        db.connect(url()),
        db.connect(url()),
        db.connect(url()),
      ]);

      expect(db.state).toBe("open");
      expect(db.endpoint?.toString()).toBe(`${url()}/rpc`);
    });

    test("接続中に異なるエンドポイントに接続するとエラー", async () => {
      await using db = new Surreal();
      await db.connect(url());

      await expect(async () => await db.connect(`${url()}/other`))
        .rejects
        .toThrowErrorMatchingInlineSnapshot(`{
  "endpoint1": "${url()}/rpc",
  "endpoint2": "${url()}/other/rpc",
  "message": "Connection conflict between ${url()}/rpc and ${url()}/other/rpc.",
  "name": "ConnectionConflictError",
}`);
      expect(db.state).toBe("open");
      expect(db.endpoint?.toString()).toBe(`${url()}/rpc`);
    });

    test("切断できる", async () => {
      await using db = new Surreal();
      await db.connect(url());

      expect(db.state).toBe("open");
      expect(db.endpoint?.toString()).toBe(`${url()}/rpc`);

      await db.close();

      expect(db.state).toBe("closed");
      expect(db.endpoint?.toString()).toBe(undefined);
    });

    test("接続状態の遷移を監視できる", async () => {
      await using db = new Surreal();
      const listener = vi.fn();
      db.on("connecting", (_, result) => listener(result));
      db.on("open", (_, result) => listener(result));
      db.on("closing", (_, result) => listener(result));
      db.on("closed", (_, result) => listener(result));

      // 2 回やる
      for (const _ of [1, 2]) {
        await db.connect(url());
        await db.close();
      }

      expect(listener.mock.calls).toStrictEqual([
        // 1 回目
        [{ state: "connecting" }],
        [{ state: "open" }],
        [{ state: "closing" }],
        [{ state: "closed" }],
        // 2 回目
        [{ state: "connecting" }],
        [{ state: "open" }],
        [{ state: "closing" }],
        [{ state: "closed" }],
      ]);
    });

    test("接続状態の遷移を一度だけ監視できる", async () => {
      await using db = new Surreal();
      const promieOpen = db.once("open");
      const promiseClosed = db.once("closed");
      await db.connect(url());
      await db.close();

      await expect(promieOpen).resolves.toStrictEqual([{ state: "open" }]);
      await expect(promiseClosed).resolves.toStrictEqual([{ state: "closed" }]);
    });
  });
}
