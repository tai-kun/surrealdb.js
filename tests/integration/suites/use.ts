"use prelude";
"use surrealdb";

import { MissingNamespace } from "@tai-kun/surrealdb/full";

test(`${IT} should switch to a specific namespace with positional arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result = await db.use("namespace_1");

  assertEquals(result, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, undefined);
});

test(`${IT} should switch to a specific namespace and database with positional arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result = await db.use("namespace_1", "database_1");

  assertEquals(result, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");
});

test(`${IT} should switch to a specific database after switching to a namespace with positional arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.use("namespace_1");
  const result2 = await db.use(null, "database_1");

  assertEquals(result1, undefined);
  assertEquals(result2, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");
});

test(`${IT} should throw error when switch to a specific database without switching to a namespace with positional arguments`, async () => {
  await using db = await connect(SURREALDB);

  await assertRejects(
    async () => {
      await db.use(null, "database_1");
    },
    MissingNamespace,
  );
});

test(`${IT} should switch to a specific namespace with array-based argument`, async () => {
  await using db = await connect(SURREALDB);
  const result = await db.use(["namespace_1"]);

  assertEquals(result, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, undefined);
});

test(`${IT} should switch to a specific namespace and database with array-based argument`, async () => {
  await using db = await connect(SURREALDB);
  const result = await db.use(["namespace_1", "database_1"]);

  assertEquals(result, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");
});

test(`${IT} should switch to a specific database after switching to a namespace with array-based argument`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.use(["namespace_1"]);
  const result2 = await db.use([null, "database_1"]);

  assertEquals(result1, undefined);
  assertEquals(result2, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");
});

test(`${IT} should throw error when switch to a specific database without switching to a namespace with array-based argument`, async () => {
  await using db = await connect(SURREALDB);

  await assertRejects(
    async () => {
      await db.use([null, "database_1"]);
    },
    MissingNamespace,
  );
});

test(`${IT} should switch to a specific namespace with named arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result = await db.use({ ns: "namespace_1" });

  assertEquals(result, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, undefined);
});

test(`${IT} should switch to a specific namespace and database with named arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result = await db.use({ ns: "namespace_1", db: "database_1" });

  assertEquals(result, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");
});

test(`${IT} should switch to a specific database after switching to a namespace with named arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.use({ ns: "namespace_1" });
  const result2 = await db.use({ db: "database_1" });

  assertEquals(result1, undefined);
  assertEquals(result2, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");
});

test(`${IT} should throw error when switch to a specific database without switching to a namespace with named arguments`, async () => {
  await using db = await connect(SURREALDB);

  await assertRejects(
    async () => {
      await db.use({ db: "database_1" });
    },
    MissingNamespace,
  );
});

test(`${IT} should switch to a specific namespace with full named arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result = await db.use({ namespace: "namespace_1" });

  assertEquals(result, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, undefined);
});

test(`${IT} should switch to a specific namespace and database with full named arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result = await db.use({
    namespace: "namespace_1",
    database: "database_1",
  });

  assertEquals(result, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");
});

test(`${IT} should switch to a specific database after switching to a namespace with full named arguments`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.use({ namespace: "namespace_1" });
  const result2 = await db.use({ database: "database_1" });

  assertEquals(result1, undefined);
  assertEquals(result2, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");
});

test(`${IT} should throw error when switch to a specific database without switching to a namespace with full named arguments`, async () => {
  await using db = await connect(SURREALDB);

  await assertRejects(
    async () => {
      await db.use({ database: "database_1" });
    },
    MissingNamespace,
  );
});

test(`${IT} should switch to specific namespaces and databases`, async () => {
  await using db = await connect(SURREALDB);
  const result1 = await db.use("namespace_1", "database_1");

  assertEquals(result1, undefined);
  assertEquals(db.connection?.ns, "namespace_1");
  assertEquals(db.connection?.db, "database_1");

  const result2 = await db.use(["namespace_2", "database_2"]);

  assertEquals(result2, undefined);
  assertEquals(db.connection?.ns, "namespace_2");
  assertEquals(db.connection?.db, "database_2");

  const result3 = await db.use({ db: "database_3" });

  assertEquals(result3, undefined);
  assertEquals(db.connection?.ns, "namespace_2");
  assertEquals(db.connection?.db, "database_3");

  const result4 = await db.use({ namespace: "namespace_4" });

  assertEquals(result4, undefined);
  assertEquals(db.connection?.ns, "namespace_4");
  assertEquals(db.connection?.db, "database_3");
});
