import { beforeAll, vi } from "vitest";

export function host(): `localhost:${number}` {
  if (typeof port !== "number") {
    throw new Error(
      "Cannot initialize Surreal outside of the test function.",
    );
  }

  return `localhost:${port}`;
}

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
