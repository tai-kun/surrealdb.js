import { CLOSED, CLOSING, CONNECTING, OPEN } from "@tai-kun/surreal/engines";
import { ConnectionConflict } from "@tai-kun/surreal/errors";
import { assertDeepEquals, assertEquals, assertRejects } from "@tools/assert";
import { before, describe, test } from "@tools/test";
import surreal from "../surreal.js";

for (
  const {
    engine,
    formatter,
    validator,
    initSurreal,
  } of surreal
) {
  describe([engine, formatter, validator].join("-"), () => {
    before(async () => {
      await surreal.ready;
    });

    test("接続できる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);

      assertEquals(db.state, OPEN);
    });

    test("同じエンドポイントであれば、重複して connect メソッドを呼び出してもエラーにならない", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await Promise.all([
        db.connect(endpoint),
        db.connect(endpoint),
        db.connect(endpoint),
      ]);

      assertEquals(db.state, OPEN);
    });

    test("別のエンドポイントで重複して connect メソッドを呼び出すとエラーになる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);

      await assertRejects(
        async () => {
          await db.connect(`${endpoint}/other`);
        },
        ConnectionConflict,
      );
      assertEquals(db.state, OPEN);
      assertEquals(
        db.getConnectionInfo()?.endpoint?.href,
        `${endpoint}/rpc`,
      );
    });

    test("切断できる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.disconnect();

      assertEquals(db.state, undefined);
      assertEquals(db.getConnectionInfo(), undefined);
    });

    test("一度だけ切断処理が実行される", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      const results = await Promise.allSettled([
        db.disconnect(),
        db.disconnect(),
        db.disconnect(),
      ]);

      assertEquals(db.state, undefined);
      assertEquals(db.getConnectionInfo(), undefined);
      assertDeepEquals(results, [
        {
          status: "fulfilled",
          value: undefined,
        },
        {
          status: "fulfilled",
          value: undefined,
        },
        {
          status: "fulfilled",
          value: undefined,
        },
      ]);
    });

    test("接続状態の遷移を監視できる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      const results: unknown[] = [];
      await using db = new Surreal();

      for (const _ of [1, 2]) {
        db.on(CONNECTING, (_, result) => {
          results.push(result);
        });
        db.on(OPEN, (_, result) => {
          results.push(result);
        });
        db.on(CLOSING, (_, result) => {
          results.push(result);
        });
        db.on(CLOSED, (_, result) => {
          results.push(result);
        });

        await db.connect(endpoint);
        await db.disconnect();
      }

      assertDeepEquals(results, [
        // 1 回目
        {
          state: CONNECTING,
        },
        {
          state: OPEN,
        },
        {
          state: CLOSING,
        },
        {
          state: CLOSED,
        },
        // 2 回目
        {
          state: CONNECTING,
        },
        {
          state: OPEN,
        },
        {
          state: CLOSING,
        },
        {
          state: CLOSED,
        },
      ]);
    });

    test("切断されると接続状態の遷移を監視できなくなる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      const results: unknown[] = [];
      await using db = new Surreal();

      db.on(CONNECTING, (_, result) => {
        results.push(result);
      });
      db.on(OPEN, (_, result) => {
        results.push(result);
      });
      db.on(CLOSING, (_, result) => {
        results.push(result);
      });
      db.on(CLOSED, (_, result) => {
        results.push(result);
      });

      // 1 回目
      await db.connect(endpoint);
      await db.disconnect();

      // 2 回目
      await db.connect(endpoint);
      await db.disconnect();

      assertDeepEquals(results, [
        // 1 回目
        {
          state: CONNECTING,
        },
        {
          state: OPEN,
        },
        {
          state: CLOSING,
        },
        {
          state: CLOSED,
        },
        // 2 回目
        // ここで接続状態の遷移を監視できなくなる。
      ]);
    });

    test("接続状態の遷移を `await` で待つことができる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      const open = db.once(OPEN);
      const closed = db.once(CLOSED);
      await db.connect(endpoint);
      await db.disconnect();

      assertDeepEquals(await open, [{
        state: OPEN,
      }]);
      assertDeepEquals(await closed, [{
        state: CLOSED,
      }]);
    });
  });
}
