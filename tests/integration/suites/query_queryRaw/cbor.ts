"use prelude";
"use surrealdb";

import {
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  // GeometryMultiLine,
  // GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Table,
  Thing,
  Uuid,
} from "@tai-kun/surrealdb/full";

test(`${IT} should return the string`, async () => {
  await using db = await connect(SURREALDB);
  const input = "Hello World!";
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertEquals(output, input);
});

test(`${IT} should return the number`, async () => {
  await using db = await connect(SURREALDB);
  const input = 123;
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertEquals(output, input);
});

test(`${IT} should return the bigint`, async () => {
  await using db = await connect(SURREALDB);
  const input = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertEquals(typeof output, "bigint");
  assertEquals(output, input);
});

test(`${IT} should return the float`, async () => {
  await using db = await connect(SURREALDB);
  const input = 123.456;
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertEquals(output, input);
});

test(`${IT} should return the true`, async () => {
  await using db = await connect(SURREALDB);
  const input = true;
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertEquals(output, input);
});

test(`${IT} should return the false`, async () => {
  await using db = await connect(SURREALDB);
  const input = false;
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertEquals(output, input);
});

test(`${IT} should return the null`, async () => {
  await using db = await connect(SURREALDB);
  const input = null;
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertEquals(output, input);
});

test(`${IT} should return the undefined`, async () => {
  await using db = await connect(SURREALDB);
  const input = undefined;
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertEquals(output, input);
});

test(`${IT} should return the array`, async () => {
  await using db = await connect(SURREALDB);
  const input = [123, { 456: true }];
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertDeepEquals(output, input);
});

test(`${IT} should return the object`, async () => {
  await using db = await connect(SURREALDB);
  const input = { num: 456, arr: [123] };
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertDeepEquals(output, input);
});

test(`${IT} should return the date`, async () => {
  await using db = await connect(SURREALDB);
  const input = new Date("2024-06-01T00:00:00Z");
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, Datetime);
  assertJsonEquals(output, input);
});

test(`${IT} should return the datetime`, async () => {
  await using db = await connect(SURREALDB);
  const input = new Datetime("2024-06-01T00:00:00Z");
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, Datetime);
  assertJsonEquals(output, input);
});

test(`${IT} should return the decimal`, async () => {
  await using db = await connect(SURREALDB);
  const input = new Decimal("123.456");
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, Decimal);
  assertJsonEquals(output, input);
});

test(`${IT} should return the duration`, async () => {
  await using db = await connect(SURREALDB);
  const input = new Duration("1y1w1d1h1s1ms");
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, Duration);
  assertJsonEquals(output, input);
});

test(`${IT} should return the geometries`, async () => {
  await using db = await connect(SURREALDB);
  const input = new GeometryCollection([
    new GeometryPoint([1, 2]),
    new GeometryMultiPolygon([
      new GeometryPolygon([
        new GeometryLine([
          new GeometryPoint([1, 1]),
          new GeometryPoint([4, 1]),
          new GeometryPoint([4, 4]),
          new GeometryPoint([1, 4]),
          new GeometryPoint([1, 1]),
        ]),
        new GeometryLine([
          new GeometryPoint([2, 2]),
          new GeometryPoint([3, 2]),
          new GeometryPoint([3, 3]),
          new GeometryPoint([2, 3]),
          new GeometryPoint([2, 2]),
        ]),
      ]),
    ]),
  ]);
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, GeometryCollection);
  assertJsonEquals(output, input);
});

test(`${IT} should return the table`, async () => {
  await using db = await connect(SURREALDB);
  const input = new Table("person");
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, Table);
  assertJsonEquals(output, input);
});

test(`${IT} should return the thing`, async () => {
  await using db = await connect(SURREALDB);
  const input = new Thing("some-custom", [
    "recordid",
    { with_an: "object" },
  ]);
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, Thing);
  assertJsonEquals(output, input);
});

test(`${IT} should return the uuid v4`, async () => {
  await using db = await connect(SURREALDB);
  const input = new Uuid("6f3c92ae-cdf6-42ee-a32d-bc9bb1c388a7");
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, Uuid);
  assertJsonEquals(output, input);
});

test(`${IT} should return the uuid v7`, async () => {
  await using db = await connect(SURREALDB);
  const input = new Uuid("018fc26a-37bb-7d39-a97f-5a62c63a15aa");
  const [output] = await db.query<[typeof input]>("$input", { input });

  assertInstanceOf(output, Uuid);
  assertJsonEquals(output, input);
});
