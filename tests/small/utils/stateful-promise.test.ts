import { StatefulPromise } from "@tai-kun/surrealdb/utils";
import { describe, expect, test, vi } from "vitest";

test("`resolve` で解決できる", async () => {
  const { promise, resolve } = StatefulPromise.withResolvers<string>();

  expect(promise.state).toBe("pending");

  resolve("test");

  expect<string>(await promise).toBe("test");
  expect(promise.state).toBe("fulfilled");
});

test("`reject` で拒否できる", async () => {
  const { promise, reject } = StatefulPromise.withResolvers();

  expect(promise.state).toBe("pending");

  reject(new Error("test"));

  await expect(async () => await promise).rejects.toThrowError("test");
  expect(promise.state).toBe("rejected");
});

test("解決後は常に同じ値を返す", async () => {
  const promise = new StatefulPromise(resolve => resolve({}));
  const [a, b] = await Promise.all([promise, promise]);

  expect(a).toBe(b);
});

test("onFulfilled 内で投げられた例外は onRejected で補足されない", async () => {
  const fn = async () => {
    await StatefulPromise.resolve().then(
      () => {
        throw 0;
      },
      () => {
        // unreachable
        // 呼び出されればエラーを握りつぶす。
      },
    );
  };

  await expect(fn).rejects.toBe(0);
});

test("Promise で解決できる", async () => {
  const { promise, resolve } = StatefulPromise.withResolvers<string>();

  expect(promise.state).toBe("pending");

  resolve(Promise.resolve("test"));
  const handleFulfilled = vi.fn();
  promise.then(handleFulfilled);
  await vi.waitUntil(() => handleFulfilled.mock.calls.length > 0);

  expect(handleFulfilled.mock.calls).toStrictEqual([
    ["test"],
  ]);
});

test.fails("(仕様確認) .try 無しで同期的に例外を投げると reject 判定にならない", async () => {
  const fn = () => {
    throw new Error("test");
  };
  const tryFn = fn;
  const fnTest = async () => {
    await expect(tryFn).rejects.toThrowError("test");
  };

  await fnTest();
});

test(".try 有りで同期的に例外を投げると reject 判定になる", async () => {
  const fn = () => {
    throw new Error("test");
  };
  const tryFn = () => StatefulPromise.try(fn);
  const fnTest = async () => {
    await expect(tryFn).rejects.toThrowError("test");
  };

  await fnTest();
});

test("拒否された StatefulPromise の理由を収集する", async () => {
  const errors = await StatefulPromise.allRejected([
    StatefulPromise.resolve(1),
    StatefulPromise.reject("reason"),
    StatefulPromise.reject(3150),
    undefined,
    1129,
  ]);

  expect(errors).toStrictEqual([
    "reason",
    3150,
  ]);
});

describe("新しいインスタンスは継承先のクラスで構築される", async () => {
  class MyStatefulPromise<T> extends StatefulPromise<T> {}

  test("constructor", async () => {
    const promise = new MyStatefulPromise<string>(resolve => resolve(""))
      .then(() => 0);

    expect(promise).toBeInstanceOf(MyStatefulPromise);
    expect<number>(await promise).toBe(0);
  });

  test(".resolve", async () => {
    const promise = MyStatefulPromise.resolve(0);

    expect(promise).toBeInstanceOf(MyStatefulPromise);
  });

  test(".reject", async () => {
    const promise = MyStatefulPromise.reject(0);

    expect(promise).toBeInstanceOf(MyStatefulPromise);
  });

  test(".withResolvers", async () => {
    const { promise, resolve } = MyStatefulPromise.withResolvers<void>();
    resolve();

    expect(promise).toBeInstanceOf(MyStatefulPromise);
  });

  test(".try", async () => {
    const promise = MyStatefulPromise.try(x => x, 0);

    expect(promise).toBeInstanceOf(MyStatefulPromise);
    expect<number>(await promise).toBe(0);
  });

  test(".allRejected", async () => {
    const promise = MyStatefulPromise.allRejected([]);

    expect(promise).toBeInstanceOf(MyStatefulPromise);
  });
});

describe("ドキュメントの例", () => {
  test("解決", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        const promise = new StatefulPromise(resolve => {
          setTimeout(() => resolve("test"), 0);
        });

        const result = await promise;

        console.log(result); // "test"
      }

      // Test
      {
        expect(spy.mock.calls).toStrictEqual([
          ["test"],
        ]);
      }
    } finally {
      spy.mockClear();
    }
  });

  test("拒否", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        const promise = new StatefulPromise((_, reject) => {
          setTimeout(() => reject("test"), 0);
        });

        while (promise.state === "pending") {
          await new Promise(r => setTimeout(r, 50));
        }

        try {
          await promise;
        } catch (e) {
          console.log(e); // "test"
        }
      }

      // Test
      {
        expect(spy.mock.calls).toStrictEqual([
          ["test"],
        ]);
      }
    } finally {
      // Clean up

      spy.mockClear();
    }
  });

  test(".try", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      // Example code
      {
        const promise = StatefulPromise.try(() => {
          throw "test";
        });

        await promise.then(null, e => {
          console.log(e); // "test"
        });
      }

      // Test
      {
        expect(spy.mock.calls).toStrictEqual([
          ["test"],
        ]);
      }
    } finally {
      // Clean up

      spy.mockClear();
    }
  });
});
