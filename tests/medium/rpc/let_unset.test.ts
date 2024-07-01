import { assertDeepEquals } from "@tools/assert";
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
  describe([engine, formatter, validator].join("-"), {
    skip: !(formatter === "json"),
  }, () => {
    before(async () => {
      await surreal.ready;
    });

    test("変数を定義する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      assertDeepEquals(result, [123]);
    });

    test("変数を再定義する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      await db.let("js_number", 456);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      assertDeepEquals(result, [456]);
    });

    test("変数を削除する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      await db.unset("js_number");
      await db.use("my_namespace", "my_database");
      const result = await db.query<[unknown]>(/*surql*/ `RETURN $js_number`);

      assertDeepEquals(result, [null]);
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

      assertDeepEquals(obj, { key: "changed" });
      assertDeepEquals(result, [{ key: "value" }]);
    });
  });

  describe([engine, formatter, validator].join("-"), {
    skip: !(formatter === "cbor"),
  }, () => {
    before(async () => {
      await surreal.ready;
    });

    test("変数を定義する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      assertDeepEquals(result, [123]);
    });

    test("変数を再定義する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      await db.let("js_number", 456);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      assertDeepEquals(result, [456]);
    });

    test("変数を削除する", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      await db.let("js_number", 123);
      await db.unset("js_number");
      await db.use("my_namespace", "my_database");
      const result = await db.query<[unknown]>(/*surql*/ `RETURN $js_number`);

      assertDeepEquals(result, [undefined]);
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

      assertDeepEquals(obj, { key: "changed" });
      assertDeepEquals(result, [{ key: "value" }]);
    });
  });
}
