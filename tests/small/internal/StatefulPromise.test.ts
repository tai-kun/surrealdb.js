import { StatefulPromise } from "@tai-kun/surrealdb/_internal";
import { assertEquals, assertRejects } from "@tools/assert";
import { test } from "@tools/test";

test("`resolve` で解決できる", async () => {
  const { promise, resolve } = StatefulPromise.withResolvers();

  assertEquals(promise.state, "pending");

  resolve("test");

  assertEquals(await promise, "test");
  assertEquals(promise.state, "fulfilled");
});

test("`await` で解決できる", async () => {
  const promise = new StatefulPromise(resolve => resolve("test"));

  assertEquals(await promise, "test");
  assertEquals(promise.state, "fulfilled");
});

test("`reject` で拒否できる", async () => {
  const { promise, reject } = StatefulPromise.withResolvers();

  assertEquals(promise.state, "pending");

  reject(new Error("test"));

  await assertRejects(
    async () => {
      await promise;
    },
    Error,
    "test",
  );
  assertEquals(promise.state, "rejected");
});

test("`await` で拒否できる", async () => {
  const promise = StatefulPromise.reject(new Error("test"));

  await assertRejects(
    async () => {
      await promise;
    },
    Error,
    "test",
  );
  assertEquals(promise.state, "rejected");
});

test("解決後は常に同じ値を返す", async () => {
  const promise = new StatefulPromise(resolve => resolve({}));
  const [a, b] = await Promise.all([promise, promise]);

  assertEquals(a, b);
});
