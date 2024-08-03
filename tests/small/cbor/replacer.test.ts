import { CONTINUE, encode } from "@tai-kun/surrealdb/cbor";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { expect, test } from "vitest";

const value = Symbol.for("ID");

test("普通にエンコードすると失敗", () => {
  expect(() => encode(value)).toThrowError(SurrealTypeError);
});

test("設定するとエンコードできるようになる", () => {
  expect(encode(value, {
    replacer(o) {
      switch (o) {
        case Symbol.for("ID"):
          return "ID";

        default:
          return CONTINUE;
      }
    },
  })).toStrictEqual(
    new Uint8Array([
      0b011_00010, // mt: 3, ai:  2
      0b0100_1001, // mt: 3, ai: 73 (I)
      0b0100_0100, // mt: 3, ai: 68 (D)
    ]),
  );
});
