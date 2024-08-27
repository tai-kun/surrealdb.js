import { createRpc, rpc } from "@tai-kun/surrealdb";
import { expect, test } from "vitest";
import { host } from "../surreal";

test("エンドポイントを事前に設定", async () => {
  const rpc = createRpc(`http://${host()}`);
  const promise = rpc("ping");

  await expect(promise).resolves.toBe(null);
});

test("デフォルトのタイムアウト時間を設定", async () => {
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  const rpc = createRpc(`http://${host()}`, {
    fetch: (...args) => delay(100).then(() => fetch(...args)),
    timeout: 0,
  });

  await expect(rpc("ping")).rejects.toThrowError(DOMException);
});

test("事前に名前空間やデータベース、トークンを設定", async () => {
  const token = await rpc(`http://${host()}`, "signin", {
    params: [{
      user: "root",
      pass: "root",
    }],
  });
  const rootRpc = createRpc(`http://${host()}`, {
    token,
    namespace: "test",
    database: "test",
  });
  const promise = rootRpc("query", {
    params: ["RETURN 42"],
  });

  await expect(promise).resolves.toStrictEqual([
    {
      status: "OK",
      time: expect.stringMatching(/^\d+/),
      result: 42,
    },
  ]);
});
