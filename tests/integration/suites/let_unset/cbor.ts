"use prelude";
"use surrealdb";

test(`${IT} should define a bigint variable and be retrieved as a number`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.let("js_bigint", 42n);
  const result2 = await db.query<[number]>("$js_bigint");

  assertEquals(result1, undefined);
  assertDeepEquals(result2, [42]);
});

test(`${IT} should define a bigint variable and be retrieved as a bigint if necessary`, async () => {
  await using db = await connect(SURREALDB);
  const maxSafeInt = BigInt(Number.MAX_SAFE_INTEGER);
  const jsBigint = maxSafeInt + 42n;
  const result1 = await db.let("js_bigint", jsBigint);
  const result2 = await db.query<[bigint]>("$js_bigint");

  assertEquals(result1, undefined);
  assertDeepEquals(result2, [jsBigint]);
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
