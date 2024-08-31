import { encode, writeNumber, type Writer } from "@tai-kun/surrealdb/cbor";
import { expect, test } from "vitest";

const bytes = new Uint8Array([
  0b110_01010, // mt: 6, ai: 10
  0b100_00001, // mt: 4, ai:  1
  0b110_01011, // mt: 6, ai: 11
  0b000_10100, // mt: 0, ai: 20
]);

test("タグ付き", () => {
  const cborValue = {
    toCBOR: () => [10, [
      { toCBOR: () => [11, 20] },
    ]],
  };

  expect(encode(cborValue)).toStrictEqual(bytes);
});

test("タグなし", () => {
  const cborValue = {
    toCBOR: () => [20],
  };

  expect(encode(cborValue)).toStrictEqual(
    new Uint8Array([
      0b000_10100, // mt: 0, ai: 20
    ]),
  );
});

test("Writer で書き込む", () => {
  const cborValue = {
    toCBOR: (w: Writer) => {
      writeNumber(w, 20);
    },
  };

  expect(encode(cborValue)).toStrictEqual(
    new Uint8Array([
      0b000_10100, // mt: 0, ai: 20
    ]),
  );
});

test("3 つ以上の要素を持つ配列を返してエラー", () => {
  const cborValue = {
    toCBOR: () => [0, 1, 2],
  };

  expect(() => encode(cborValue)).toThrowErrorMatchingSnapshot();
});

test("空配列を返してエラー", () => {
  const cborValue = {
    toCBOR: () => [],
  };

  expect(() => encode(cborValue)).toThrowErrorMatchingSnapshot();
});
