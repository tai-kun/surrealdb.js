"use prelude";
"use surrealdb";

import { ResponseError, surql } from "@tai-kun/surrealdb/full";

test(`${IT} should return the raw results of a query`, async () => {
  await using db = await connect(SURREALDB);
  await db.use("test_namespace", "test_database");
  const num = 42;
  const query = surql`
    RETURN ${num};
    RETURN fn::undefined_function();
  `;
  const results = await db.queryRaw(query);

  assertDeepEquals(results, [
    {
      status: "OK",
      time: results[0]!.time,
      result: 42,
    },
    {
      status: "ERR",
      time: results[1]!.time,
      result: "The function 'fn::undefined_function' does not exist",
    },
  ]);
});

test(`${IT} should throw a ResponseError when excutes an invalid query`, async () => {
  await using db = await connect(SURREALDB);
  const query = surql`
    OUTPUT "OK";
  `;

  await assertRejects(
    async () => {
      await db.queryRaw(query);
    },
    ResponseError,
    "Parse error: Failed to parse query",
  );
});

test(`${IT} should return the results of a query`, async () => {
  await using db = await connect(SURREALDB);
  await db.use("test_namespace", "test_database");
  const results = await db.query<[42]>(
    /* surql */ `
      $named_variable;
    `,
    {
      named_variable: 42,
    },
  );

  assertDeepEquals(results, [42]);
});

test(`${IT} should throw a ResponseError when the results includes some errors`, async () => {
  await using db = await connect(SURREALDB);
  await db.use("test_namespace", "test_database");
  let error: ResponseError;

  try {
    await db.query(
      /* surql */ `
        RETURN 42;
        RETURN fn::undefined_function();
      `,
    );
  } catch (e) {
    error = e as ResponseError;
  }

  assertInstanceOf(error!, ResponseError);
  assert(error!.message.includes("Failed to execute the query."));
  assertDeepEquals(error!.cause, [
    "The function 'fn::undefined_function' does not exist",
  ]);
});
