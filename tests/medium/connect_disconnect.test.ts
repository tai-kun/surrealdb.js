import { Surreal } from "@tai-kun/surrealdb";
import { OPEN } from "@tai-kun/surrealdb/engine";
import { beforeAll, expect, test, vi } from "vitest";

let port: number;

beforeAll(async () => {
  port = await vi.waitFor(
    async () => {
      const resp = await fetch("http://localhost:3150");

      if (resp.status !== 200) {
        throw new Error(resp.statusText);
      }

      const text = await resp.text();
      const port = Number(text);

      return port;
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
  await vi.waitFor(
    async () => {
      const resp = await fetch(`http://localhost:${port}/health`);
      await resp.body?.cancel();

      if (resp.status !== 200) {
        throw new Error(resp.statusText);
      }
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
});

test("接続できる", async () => {
  await using db = new Surreal();
  await db.connect(`http://localhost:${port}`);

  expect(db.state).toBe(OPEN);
});
