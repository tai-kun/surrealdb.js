import { decode, encode, Tagged } from "@tai-kun/surreal/cbor";
import { expect, test } from "vitest";

const value = new Tagged(10, [new Tagged(11, 20)]);
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
