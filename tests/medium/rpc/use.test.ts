import { assertEquals } from "@tools/assert";
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
  describe([engine, formatter, validator].join("-"), () => {
    before(async () => {
      await surreal.ready;
    });

    test("特定の名前空間に切り替える", async () => {
      const { endpoint, Surreal } = await initSurreal();
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
      const { endpoint, Surreal } = await initSurreal();
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
  });
}
