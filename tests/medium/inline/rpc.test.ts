import { rpc } from "@tai-kun/surrealdb";
import CborFormatter from "@tai-kun/surrealdb/cbor-formatter";
import * as decodeOnlyDataTypes from "@tai-kun/surrealdb/decodeonly-datatypes";
import { Jwt } from "@tai-kun/surrealdb/standard-client";
import { expect, test } from "vitest";
import { host } from "../surreal";

test(".ping()", async () => {
  const promise = rpc(`http://${host()}`, "ping");

  await expect(promise).resolves.toBe(null);
});

test(".signin()", async () => {
  const token = await rpc(`http://${host()}`, "signin", {
    params: [{
      user: "root",
      pass: "root",
    }],
  });

  expect(Jwt.isWellFormed(token)).toBe(true);
});

test(".query()", async () => {
  const token = await rpc(`http://${host()}`, "signin", {
    params: [{
      user: "root",
      pass: "root",
    }],
  });
  const promise = rpc(`http://${host()}`, "query", {
    params: ["RETURN $value", {
      value: 42,
    }],
    token,
    namespace: "test",
    database: "test",
  });

  await expect(promise).resolves.toStrictEqual([
    {
      status: "OK",
      time: expect.stringMatching(/^\d+/),
      result: 42,
    },
  ]);
});

test("カスタムフォーマッター", async () => {
  const formatter = new CborFormatter(decodeOnlyDataTypes);
  const token = await rpc(`http://${host()}`, "signin", {
    params: [{
      user: "root",
      pass: "root",
    }],
    formatter,
  });
  const promise = rpc(`http://${host()}`, "query", {
    params: ["RETURN foo:bar"],
    formatter,
    token,
    namespace: "test",
    database: "test",
  });

  await expect(promise).resolves.toStrictEqual([
    {
      status: "OK",
      time: expect.stringMatching(/^\d+/),
      result: new decodeOnlyDataTypes.Thing(["foo", "bar"]),
    },
  ]);
});
