import { CLOSED, CLOSING, CONNECTING, OPEN } from "@tai-kun/surrealdb/engine";
import { describe, expect, test, vi } from "vitest";
import surreal from "../surreal";

for (const { suite, Surreal, url } of surreal) {
  describe(suite, () => {
    test("接続できる", async () => {
      await using db = new Surreal();
      await db.connect(url());

      expect(db.state).toBe(OPEN);
      expect(db.endpoint?.toString()).toBe(`${url()}/rpc`);
    });

    test("同じエンドポイントであれば連続して接続できる", async () => {
      await using db = new Surreal();
      await Promise.all([
        db.connect(url()),
        db.connect(url()),
        db.connect(url()),
      ]);

      expect(db.state).toBe(OPEN);
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
      expect(db.state).toBe(OPEN);
      expect(db.endpoint?.toString()).toBe(`${url()}/rpc`);
    });

    test("切断できる", async () => {
      await using db = new Surreal();
      await db.connect(url());

      expect(db.state).toBe(OPEN);
      expect(db.endpoint?.toString()).toBe(`${url()}/rpc`);

      await db.disconnect();

      expect(db.state).toBe(CLOSED);
      expect(db.endpoint?.toString()).toBe(undefined);
    });

    test("接続状態の遷移を監視できる", async () => {
      await using db = new Surreal();
      const listener = vi.fn();
      db.on(CONNECTING, (_, result) => listener(result));
      db.on(OPEN, (_, result) => listener(result));
      db.on(CLOSING, (_, result) => listener(result));
      db.on(CLOSED, (_, result) => listener(result));

      // 2 回やる
      for (const _ of [1, 2]) {
        await db.connect(url());
        await db.disconnect();
      }

      expect(listener.mock.calls).toStrictEqual([
        // 1 回目
        [{ state: CONNECTING }],
        [{ state: OPEN }],
        [{ state: CLOSING }],
        [{ state: CLOSED }],
        // 2 回目
        [{ state: CONNECTING }],
        [{ state: OPEN }],
        [{ state: CLOSING }],
        [{ state: CLOSED }],
      ]);
    });

    test("接続状態の遷移を一度だけ監視できる", async () => {
      await using db = new Surreal();
      const promieOpen = db.once(OPEN);
      const promiseClosed = db.once(CLOSED);
      await db.connect(url());
      await db.disconnect();

      await expect(promieOpen).resolves.toStrictEqual([{ state: OPEN }]);
      await expect(promiseClosed).resolves.toStrictEqual([{ state: CLOSED }]);
    });
  });
}
