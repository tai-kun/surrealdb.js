import { createSurql, query, rpc } from "@tai-kun/surrealdb";
import JsonFormatter from "@tai-kun/surrealdb/formatters/json";
import { beforeAll, expect, expectTypeOf, test } from "vitest";
import { host } from "../surreal";

let token = "";

beforeAll(async () => {
  token = await rpc(`http://${host()}`, "signin", {
    params: [{
      user: "root",
      pass: "root",
    }],
  });
});

test("通常のクエリー", async () => {
  const promise = query(`http://${host()}`, "RETURN 42", {}, {
    token,
    namespace: "test",
    database: "test",
  });

  await expect(promise).resolves.toStrictEqual([42]);
});

test("事前に定義されたクエリー", async () => {
  const surql = createSurql({
    formatter: new JsonFormatter(),
  });

  const ValueSlot = surql.slot("value");

  const ReturnValueQuery = surql`RETURN ${ValueSlot}`.as<[unknown]>();

  const promise = query(`http://${host()}`, ReturnValueQuery, {
    value: undefined,
  }, {
    token,
    namespace: "test",
    database: "test",
  });

  expectTypeOf<typeof promise>().toEqualTypeOf<Promise<[unknown]>>();

  await expect(promise).resolves.toStrictEqual([null]);
});

test("1 つ以上クエリーに失敗したらエラー", async () => {
  const promise = query(
    `http://${host()}`,
    /* surql */ `
      RETURN 0;
      RETURN fn::undefined_function(); -- ERROR
    `,
    {},
    {
      token,
      namespace: "test",
      database: "test",
    },
  );

  await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`{
  "cause": [
    "The function 'fn::undefined_function' does not exist",
  ],
  "message": "Query failed with 1 error(s).",
  "name": "QueryFailedError",
}`);
});
