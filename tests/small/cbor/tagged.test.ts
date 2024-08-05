import {
  decode,
  encode,
  Tagged,
  writeInteger,
  type Writer,
} from "@tai-kun/surrealdb/cbor";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { expect, test } from "vitest";

const value = new Tagged(10, [
  new Tagged(11, 20),
]);
const bytes = new Uint8Array([
  0b110_01010, // mt: 6, ai: 10
  0b100_00001, // mt: 4, ai:  1
  0b110_01011, // mt: 6, ai: 11
  0b000_10100, // mt: 0, ai: 20
]);

test("decode", () => {
  expect(decode(bytes)).toStrictEqual(value);
});

test("encode", () => {
  expect(encode(value)).toStrictEqual(bytes);
});

test("reviver", () => {
  expect(
    decode(bytes, {
      reviver: {
        tagged(t) {
          switch (t.tag) {
            case 10:
              return t.value;

            case 11:
              return t.value;

            default:
              return undefined;
          }
        },
      },
    }),
  )
    .toStrictEqual([20]);
});

test("toCBOR", () => {
  const cborValue = {
    toCBOR: () => [10, [
      { toCBOR: () => [11, 20] },
    ]],
  };

  expect(encode(cborValue)).toStrictEqual(bytes);
});

test("タグなし toCBOR", () => {
  const cborValue = {
    toCBOR: () => [20],
  };

  expect(encode(cborValue)).toStrictEqual(
    new Uint8Array([
      0b000_10100, // mt: 0, ai: 20
    ]),
  );
});

test("Writer で書き込む toCBOR", () => {
  const cborValue = {
    toCBOR: (w: Writer) => {
      writeInteger(w, 20);
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

  expect(() => encode(cborValue)).toThrowError(SurrealTypeError);
});

test("空配列を返してエラー", () => {
  const cborValue = {
    toCBOR: () => [],
  };

  expect(() => encode(cborValue)).toThrowError(SurrealTypeError);
});
