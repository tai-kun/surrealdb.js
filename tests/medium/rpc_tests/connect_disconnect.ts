import { CLOSED, CLOSING, CONNECTING, OPEN } from "@tai-kun/surrealdb/engines";
import { ConnectionConflict } from "@tai-kun/surrealdb/errors";
import { assertDeepEquals, assertEquals, assertRejects } from "@tools/assert";
import { test } from "@tools/test";

test("接続できる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);

  assertEquals(db.state, OPEN);
});

test("同じエンドポイントであれば、重複して connect メソッドを呼び出してもエラーにならない", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await Promise.all([
    db.connect(endpoint),
    db.connect(endpoint),
    db.connect(endpoint),
  ]);

  assertEquals(db.state, OPEN);
});

test("別のエンドポイントで重複して connect メソッドを呼び出すとエラーになる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);

  await assertRejects(
    async () => {
      await db.connect(`${endpoint}/other`);
    },
    ConnectionConflict,
  );
  assertEquals(db.state, OPEN);
  assertEquals(db.connection?.endpoint?.toString(), `${endpoint}/rpc`);
});

test("切断できる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  const result = await db.disconnect();

  assertEquals(db.state, CLOSED);
  assertEquals(db.connection, null);
  assertDeepEquals(result, { ok: true });
});

test("一度だけ切断処理が実行される", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  const results = await Promise.all([
    db.disconnect(),
    db.disconnect(),
    db.disconnect(),
  ]);

  assertEquals(db.state, CLOSED);
  assertEquals(db.connection, null);
  assertDeepEquals(results, [
    {
      ok: true,
    },
    {
      ok: true,
      value: "AlreadyDisconnected",
    },
    {
      ok: true,
      value: "AlreadyDisconnected",
    },
  ]);
});

test("接続状態の遷移を監視できる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
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
      ok: true,
      value: CONNECTING,
    },
    {
      ok: true,
      value: OPEN,
    },
    {
      ok: true,
      value: CLOSING,
    },
    {
      ok: true,
      value: CLOSED,
    },
    // 2 回目
    {
      ok: true,
      value: CONNECTING,
    },
    {
      ok: true,
      value: OPEN,
    },
    {
      ok: true,
      value: CLOSING,
    },
    {
      ok: true,
      value: CLOSED,
    },
  ]);
});

test("切断されると接続状態の遷移を監視できなくなる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
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
      ok: true,
      value: CONNECTING,
    },
    {
      ok: true,
      value: OPEN,
    },
    {
      ok: true,
      value: CLOSING,
    },
    {
      ok: true,
      value: CLOSED,
    },
    // 2 回目
    // ここで接続状態の遷移を監視できなくなる。
  ]);
});

test("接続状態の遷移を `await` で待つことができる", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  const promiseOpen = db.once(OPEN);
  const promiseClosed = db.once(CLOSED);
  await db.connect(endpoint);
  await db.disconnect();

  assertDeepEquals(await promiseOpen, [{
    ok: true,
    value: OPEN,
  }]);
  assertDeepEquals(await promiseClosed, [{
    ok: true,
    value: CLOSED,
  }]);
});
