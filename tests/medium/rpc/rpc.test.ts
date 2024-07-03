import { getTimeoutSignal } from "@tai-kun/surreal/_lib";
import assert from "@tools/assert";
import { beforeAll, describe, test } from "@tools/test";
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
    beforeAll(async () => {
      await surreal.ready;
    });

    test("rpc が使える", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);
      const [queryResult] = await db.rpc("query", [/*surql*/ `RETURN 1`]);

      assert.equal(queryResult?.result, 1);
    });

    test("rpc のタイムアウトを設定できる", async () => {
      const { endpoint, Surreal } = await initSurreal();
      await using db = new Surreal();
      await db.connect(endpoint);

      await assert.rejects(
        async () => {
          await db.rpc("query", [/*surql*/ `SLEEP 3s`], {
            signal: getTimeoutSignal(1_000),
          });
        },
        Error,
      );
    });
  });
}
