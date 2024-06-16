import { assertDeepEquals } from "@tools/assert";
import { test } from "@tools/test";

test("変数を定義する", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  await db.let("js_number", 123);
  const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

  assertDeepEquals(result, [123]);
});

test("変数を再定義する", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  await db.let("js_number", 123);
  await db.let("js_number", 456);
  const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

  assertDeepEquals(result, [456]);
});

test("変数を削除する", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  await db.let("js_number", 123);
  await db.unset("js_number");
  await db.use("my_namespace", "my_database");
  const result = await db.query<[unknown]>(/*surql*/ `RETURN $js_number`);

  assertDeepEquals(result, [null]);
});

test("変数は不変である", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  const obj = { key: "value" };
  await db.let("js_object", obj);
  obj.key = "changed";
  const result = await db.query<[typeof obj]>(/*surql*/ `RETURN $js_object`);

  assertDeepEquals(obj, { key: "changed" });
  assertDeepEquals(result, [{ key: "value" }]);
});
