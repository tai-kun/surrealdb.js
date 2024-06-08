"use prelude";
"use surrealdb";

import { CLOSED, ConnectionConflict, OPEN } from "@tai-kun/surrealdb/full";

test(`${IT} should connect to the endpoint`, async () => {
  await using db = await connect(SURREALDB);

  assertEquals(db.state, OPEN);
});

test(`${IT} should keep connection to the same endpoint`, async () => {
  await using db = await connect(SURREALDB);
  const protocol = db.connection!.url!.protocol;
  await Promise.all([
    db.connect(`${protocol}//${SURREALDB.host}`),
    db.connect(`${protocol}//${SURREALDB.host}`),
    db.connect(`${protocol}//${SURREALDB.host}`),
  ]);

  assertEquals(db.state, OPEN);
});

test(`${IT} should throw when connecting to a different endpoint`, async () => {
  await using db = await connect(SURREALDB);

  await assertRejects(
    async () => {
      await db.connect("http://example.com");
    },
    ConnectionConflict,
  );
});

test(`${IT} should disconnect from the endpoint`, async () => {
  const db = await connect(SURREALDB);
  const result = await db.disconnect();

  assertEquals(db.state, CLOSED);
  assertDeepEquals(result, {
    ok: true,
  });
});

test(`${IT} should disconnect from the endpoint only once`, async () => {
  const db = await connect(SURREALDB);
  await db.disconnect();
  const results = await Promise.all([
    db.disconnect(),
    db.disconnect(),
    db.disconnect(),
  ]);

  assertDeepEquals(results, [
    {
      ok: true,
      value: "AlreadyDisconnected",
    },
    {
      ok: true,
      value: "AlreadyDisconnected",
    },
    {
      ok: true,
      value: "AlreadyDisconnected",
    },
  ]);
});
