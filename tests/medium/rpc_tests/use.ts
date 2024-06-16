import { assertEquals } from "@tools/assert";
import { test } from "@tools/test";

test("特定の名前空間に切り替える", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  const [
    infoForNs1,
    infoForDb1,
  ] = await db.queryRaw(/*surql*/ `
    INFO FOR NS;
    INFO FOR DB;
  `);
  await db.use("my_namespace");
  const [
    infoForNs2,
    infoForDb2,
  ] = await db.queryRaw(/*surql*/ `
    INFO FOR NS;
    INFO FOR DB;
  `);

  assertEquals(infoForNs1?.status, "ERR");
  assertEquals(infoForDb1?.status, "ERR");

  assertEquals(infoForNs2?.status, "OK");
  assertEquals(infoForDb2?.status, "ERR");
});

test("特定の名前空間とデータベースに切り替える。", async () => {
  const { endpoint, Surreal } = await getInitializedSurreal();
  await using db = new Surreal();
  await db.connect(endpoint);
  const [
    infoForNs1,
    infoForDb1,
  ] = await db.queryRaw(/*surql*/ `
    INFO FOR NS;
    INFO FOR DB;
  `);
  await db.use("my_namespace", "my_database");
  const [
    infoForNs2,
    infoForDb2,
  ] = await db.queryRaw(/*surql*/ `
    INFO FOR NS;
    INFO FOR DB;
  `);

  assertEquals(infoForNs1?.status, "ERR");
  assertEquals(infoForDb1?.status, "ERR");

  assertEquals(infoForNs2?.status, "OK");
  assertEquals(infoForDb2?.status, "OK");
});
