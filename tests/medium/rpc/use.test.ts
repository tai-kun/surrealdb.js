import assert from "@tools/assert";
import { beforeAll, describe, test } from "@tools/test";
import surreal from "../surreal.js";

for (const { suiteName, initSurreal } of surreal) {
  describe(suiteName, () => {
    beforeAll(async () => {
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

      assert.equal(infoForNs1?.status, "ERR");
      assert.equal(infoForDb1?.status, "ERR");

      assert.equal(infoForNs2?.status, "OK");
      assert.equal(infoForDb2?.status, "ERR");
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

      assert.equal(infoForNs1?.status, "ERR");
      assert.equal(infoForDb1?.status, "ERR");

      assert.equal(infoForNs2?.status, "OK");
      assert.equal(infoForDb2?.status, "OK");
    });
  });
}
