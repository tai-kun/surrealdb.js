import { afterAll, beforeAll, vi } from "vitest";

export function host(): `127.0.0.1:${number}` {
  if (typeof port !== "number") {
    throw new Error("ポート番号が確定する前にホストを取得できません。");
  }

  return `127.0.0.1:${port}`;
}

let port: number;

beforeAll(async () => {
  port = await vi.waitFor(
    async () => {
      const resp = await fetch("http://127.0.0.1:3150/surrealdb/start", {
        method: "POST",
      });

      if (!resp.ok) {
        await resp.body?.cancel();
        throw new Error(resp.statusText);
      }

      const text = await resp.text();

      return Number(text);
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
  await vi.waitFor(
    async () => {
      const resp = await fetch(`http://${host()}/health`);
      await resp.body?.cancel();

      if (!resp.ok) {
        throw new Error(resp.statusText);
      }
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
}, 30e3);

afterAll(async () => {
  try {
    const resp = await fetch("http://127.0.0.1:3150/stop", {
      method: "POST",
      body: String(port),
    });
    await resp.body?.cancel();
  } catch (e) {
    console.warn(e);
  }
});
