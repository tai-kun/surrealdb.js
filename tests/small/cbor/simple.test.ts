import { decode, encode, Simple } from "@tai-kun/surrealdb/cbor";
import { expect, test } from "vitest";

const value = new Simple(32); // 32 は未割り当て
const bytes = new Uint8Array([
  0b111_11000, // mt: 7, ai: 24
  0b0010_0000, // mt: 0, ai: 32
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
        simple(s) {
          switch (s.value) {
            case 32:
              return "simple(32)";

            default:
              return undefined;
          }
        },
      },
    }),
  )
    .toBe("simple(32)");
});

test("simple(20) -> false", () => {
  expect(decode(encode(new Simple(20)))).toBe(false);
});

test("simple(21) -> true", () => {
  expect(decode(encode(new Simple(21)))).toBe(true);
});

test("simple(22) -> null", () => {
  expect(decode(encode(new Simple(22)))).toBe(null);
});

test("simple(23) -> undefined", () => {
  expect(decode(encode(new Simple(23)))).toBe(undefined);
});
