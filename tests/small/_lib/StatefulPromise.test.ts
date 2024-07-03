import { StatefulPromise } from "@tai-kun/surreal/_lib";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("`resolve` で解決できる", async () => {
  const { promise, resolve } = StatefulPromise.withResolvers();

  assert.equal(promise.state, "pending");

  resolve("test");

  assert.equal(await promise, "test");
  assert.equal(promise.state, "fulfilled");
});

test("`await` で解決できる", async () => {
  const promise = new StatefulPromise(resolve => resolve("test"));

  assert.equal(await promise, "test");
  assert.equal(promise.state, "fulfilled");
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
  );
  assert.equal(promise.state, "rejected");
});

test("`await` で拒否できる", async () => {
  const promise = StatefulPromise.reject(new Error("test"));

  await assert.rejects(
    async () => {
      await promise;
    },
    {
      name: "Error",
      message: "test",
    },
  );
  assert.equal(promise.state, "rejected");
});

test("解決後は常に同じ値を返す", async () => {
  const promise = new StatefulPromise(resolve => resolve({}));
  const [a, b] = await Promise.all([promise, promise]);

  assert.equal(a, b);
});
