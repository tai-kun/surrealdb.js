import { StatefulPromise } from "@tai-kun/surreal/_lib";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("`resolve` で解決できる", async () => {
  const { promise, resolve } = StatefulPromise.withResolvers();

  assert.equal(
    promise.state,
    "pending",
    "未解決時の状態は pending を示すべきです。",
  );

  resolve("test");

  assert.equal(await promise, "test", "`resolve` に渡した値が返るべきです。");
  assert.equal(
    promise.state,
    "fulfilled",
    "解決後の状態は fulfilled を示すべきです。",
  );
});

test("`reject` で拒否できる", async () => {
  const { promise, reject } = StatefulPromise.withResolvers();

  assert.equal(promise.state, "pending");

  reject(new Error("test"));

  await assert.rejects(
    async () => {
      await promise;
    },
    {
      name: "Error",
      message: "test",
    },
    "`reject` に渡した値が投げられるべきです。",
  );
  assert.equal(
    promise.state,
    "rejected",
    "拒否後の状態は rejected を示すべきです。",
  );
});

test("解決後は常に同じ値を返す", async () => {
  const promise = new StatefulPromise(resolve => resolve({}));
  const [a, b] = await Promise.all([promise, promise]);

  assert.equal(a, b);
});
