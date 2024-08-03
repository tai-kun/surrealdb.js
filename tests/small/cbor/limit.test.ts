import { encode } from "@tai-kun/surrealdb/cbor";
import { CborMaxDepthReachedError } from "@tai-kun/surrealdb/errors";
import { expect, test } from "vitest";

const value = [[[[[[[[[[[[[[]]]]]]]]]]]]]];

test("普通にエンコードすると失敗", () => {
  expect(() => encode(value, { maxDepth: 5 }))
    .toThrowError(CborMaxDepthReachedError);
});
