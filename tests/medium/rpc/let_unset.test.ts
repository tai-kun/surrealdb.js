import assert from "@tools/assert";
import { beforeAll, describe, test } from "@tools/test";
import surreal from "../surreal.js";

for (const { suiteName, formatter, initSurreal } of surreal) {
  describe(suiteName, {
    skip: !(formatter === "json"),
  }, () => {
    beforeAll(async () => {
      await surreal.ready;
    });

    test("変数を定義する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      assert.deepEqual(result, [123]);
    });

    test("変数を再定義する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      await db.let("js_number", 456);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      assert.deepEqual(result, [456]);
    });

    test("変数を削除する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      await db.unset("js_number");
      await db.use("my_namespace", "my_database");
      const result = await db.query<[unknown]>(/*surql*/ `RETURN $js_number`);

      assert.deepEqual(result, [null]);
    });

    test("変数は不変である", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      const obj = { key: "value" };
      await db.let("js_object", obj);
      obj.key = "changed";
      const result = await db.query<[typeof obj]>(
        /*surql*/ `RETURN $js_object`,
      );

      assert.deepEqual(obj, { key: "changed" });
      assert.deepEqual(result, [{ key: "value" }]);
    });
  });

  describe(suiteName, {
    skip: !(formatter === "cbor"),
  }, () => {
    beforeAll(async () => {
      await surreal.ready;
    });

    test("変数を定義する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      assert.deepEqual(result, [123]);
    });

    test("変数を再定義する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      await db.let("js_number", 456);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      assert.deepEqual(result, [456]);
    });

    test("変数を削除する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      await db.unset("js_number");
      await db.use("my_namespace", "my_database");
      const result = await db.query<[unknown]>(/*surql*/ `RETURN $js_number`);

      assert.deepEqual(result, [undefined]);
    });

    test("変数は不変である", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      const obj = { key: "value" };
      await db.let("js_object", obj);
      obj.key = "changed";
      const result = await db.query<[typeof obj]>(
        /*surql*/ `RETURN $js_object`,
      );

      assert.deepEqual(obj, { key: "changed" });
      assert.deepEqual(result, [{ key: "value" }]);
    });
  });
}
