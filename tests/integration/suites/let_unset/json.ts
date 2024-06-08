"use prelude";
"use surrealdb";

import { ResponseError } from "@tai-kun/surrealdb/full";

test(`${IT} should define a number variable`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.let("js_number", 42);
  const result2 = await db.query<[number]>("$js_number");

  assertEquals(result1, undefined);
  assertDeepEquals(result2, [42]);
});

test(`${IT} should throw an error when defining a bigint variable`, async () => {
  await using db = await connect(SURREALDB);

  await assertRejects(
    async () => {
      await db.let("js_bigint", 42n);
    },
    TypeError,
    "Do not know how to serialize a BigInt",
  );
});

test(`${IT} should redefine a variable`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.let("js_string", "foo");
  const result2 = await db.let("js_string", "bar");
  const result3 = await db.query<[string]>("$js_string");

  assertEquals(result1, undefined);
  assertEquals(result2, undefined);
  assertDeepEquals(result3, ["bar"]);
});

test(`${IT} should remove a variable`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.let("js_number", 42);
  const result2 = await db.unset("js_number");

  // The variable is no longer available in the current session,
  // so we need to switch to the namespace and database to find it.
  await assertRejects(
    async () => {
      await db.query("$js_number");
    },
    ResponseError,
  );

  await db.use("test_namespace", "test_database");
  const result3 = await db.query<[null]>("$js_number");

  assertEquals(result1, undefined);
  assertEquals(result2, undefined);
  assertDeepEquals(result3, [null]);
});

test(`${IT} should be immutability`, async () => {
  await using db = await connect(SURREALDB);
  const value = { foo: "bar" };
  const result1 = await db.let("js_object", value);
  value.foo = "baz";
  const result2 = await db.query<[typeof value]>("$js_object");

  assertEquals(result1, undefined);
  assertDeepEquals(result2, [{ foo: "bar" }]);
  assertDeepEquals(value, { foo: "baz" });
  assertNotEquals(result2[0], value);
});
