import { decode } from "@tai-kun/surrealdb/cbor";
import { CborMaxDepthReachedError } from "@tai-kun/surrealdb/errors";
import { describe, expect, test } from "vitest";

describe("maxDepth", () => {
  test("最大深さと同じ深さなら大丈夫", () => {
    // [[]]
    const bytes = new Uint8Array([
      0x81, // mt: 4, ai: 1
      0x80, // mt: 4, ai: 0
    ]);

    const run = () => {
      decode(
        bytes,
        { maxDepth: 2 },
      );
    };
    expect(run).not.toThrowError(CborMaxDepthReachedError);
  });

  test("最大深さを超えるオブジェクトでエラー", () => {
    // [[[]]]
    const bytes = new Uint8Array([
      0x81, // mt: 4, ai: 1
      0x81, // mt: 4, ai: 1
      0x80, // mt: 4, ai: 0
    ]);

    const run = () => {
      const a = decode(
        bytes,
        { maxDepth: 2 },
      );
      console.dir(a, { depth: null });
    };
    expect(run).toThrowError(CborMaxDepthReachedError);
  });
});
