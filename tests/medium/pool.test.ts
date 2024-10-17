import { Pool } from "@tai-kun/surrealdb";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { stopSurrealDb, viWaitForSurrealDb } from "./surrealdb";

let port: number;

beforeAll(async () => {
  port = await viWaitForSurrealDb();
}, 30e3);

afterAll(async () => {
  try {
    await stopSurrealDb(port);
  } catch (e) {
    console.warn(e);
  }
});

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

test("接続を再利用する", { timeout: 15e3 }, async () => {
  await using pool = new Pool({
    alias: {
      test: `ws://127.0.0.1:${port}`,
    },
    closeDelay: 1e3,
  });
  const openListener = vi.fn();
  const closeListener = vi.fn();
  let db: Awaited<ReturnType<typeof pool.get>>;
  {
    using db1 = await pool.get("test");
    db1.on("open", openListener);
    db1.on("closed", closeListener);

    expect(db1.state).toBe("open");
    expect(db1.endpoint?.href).toBe(`ws://127.0.0.1:${port}/rpc`);

    {
      using db2 = await pool.get("test");

      expect(db2).toBe(db1);

      {
        using db3 = await pool.get("test");

        expect(db3).toBe(db2);
        expect(db3).toBe(db1);
      }

      await sleep(2e3);

      expect(db1.state).toBe("open");
    }

    await sleep(2e3);

    expect(db1.state).toBe("open");

    db = db1;
  }

  expect(db.state).toBe("open");

  await sleep(2e3);

  expect(db.state).toBe("closed");
  expect(openListener).toBeCalledTimes(0);
  expect(closeListener).toBeCalledTimes(1);

  using newDb = await pool.get("test");

  expect(newDb).not.toBe(db);
});
