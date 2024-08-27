import { createQuery, rpc } from "@tai-kun/surrealdb";
import { beforeAll, expect, test } from "vitest";
import { host } from "../surreal";

let token = "";

beforeAll(async () => {
  token = await rpc(`http://${host()}`, "signin", {
    params: [{
      user: "root",
      pass: "root",
    }],
  });
});

test("エンドポイントを事前に設定", async () => {
  const query = createQuery(`http://${host()}`);
  const promise = query("RETURN NONE", {}, {
    token,
    namespace: "test",
    database: "test",
  });

  await expect(promise).resolves.toStrictEqual([null]);
});

test("デフォルトのタイムアウト時間を設定", async () => {
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  const query = createQuery(`http://${host()}`, {
    fetch: (...args) => delay(100).then(() => fetch(...args)),
    timeout: 0,
  });

  await expect(query("RETURN NONE")).rejects.toThrowError(DOMException);
});

test("事前に名前空間やデータベース、トークンを設定", async () => {
  const query = createQuery(`http://${host()}`, {
    token,
    namespace: "test",
    database: "test",
  });
  const promise = query("RETURN $value", {
    value: 42,
  });

  await expect(promise).resolves.toStrictEqual([42]);
});

test("事前に変数を用意", async () => {
  const query = createQuery(`http://${host()}`, {
    bindings: {
      value: 42,
    },
  });
  const promise = query("RETURN $value", {}, {
    token,
    namespace: "test",
    database: "test",
  });

  await expect(promise).resolves.toStrictEqual([42]);
});
