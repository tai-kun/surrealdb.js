import { vi } from "vitest";

export async function viWaitForSurrealDb(): Promise<number> {
  const port = await vi.waitFor(
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
      const resp = await fetch(`http://127.0.0.1:${port}/health`);
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

  return port;
}

export async function stopSurrealDb(port: number): Promise<void> {
  if (typeof port !== "number") {
    return;
  }

  const resp = await fetch("http://127.0.0.1:3150/stop", {
    method: "POST",
    body: String(port),
  });
  await resp.body?.cancel();
}
