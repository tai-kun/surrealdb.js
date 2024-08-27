import { surql, Thing } from "@tai-kun/surrealdb";
import type { Writer } from "@tai-kun/surrealdb/cbor";
import { EncodedCBOR } from "@tai-kun/surrealdb/formatter";
import { afterEach, expect, test, vi } from "vitest";

const writeBytes = vi.fn();
const writer = { writeBytes } as unknown as Writer;

afterEach(() => {
  writeBytes.mockClear();
});

test("文字列を変数ではなく SurrealQL に埋め込む", () => {
  const ReturnQuery = surql`${surql.raw("RETURN 0")};`;

  expect(ReturnQuery.text).toBeInstanceOf(EncodedCBOR);
  (ReturnQuery.text as EncodedCBOR).toCBOR(writer);
  expect(writeBytes.mock.calls).toStrictEqual([
    [
      // `RETURN 0;`
      new Uint8Array([
        0b011_01001, // mt: 3, ai: 9
        0x52, // `R`
        0x45, // `E`
        0x54, // `T`
        0x55, // `U`
        0x52, // `R`
        0x4e, // `N`
        0x20, // ` `
        0x30, // `0`
        0x3b, // `;`
      ]),
    ],
  ]);
});

test(".toSurql() が返す文字列を SurrealQL に埋め込む", () => {
  const ReturnQuery = surql`${surql.raw({ toSurql: () => "RETURN 0" })};`;

  expect(ReturnQuery.text).toBeInstanceOf(EncodedCBOR);
  (ReturnQuery.text as EncodedCBOR).toCBOR(writer);
  expect(writeBytes.mock.calls).toStrictEqual([
    [
      // `RETURN 0;`
      new Uint8Array([
        0b011_01001, // mt: 3, ai: 9
        0x52, // `R`
        0x45, // `E`
        0x54, // `T`
        0x55, // `U`
        0x52, // `R`
        0x4e, // `N`
        0x20, // ` `
        0x30, // `0`
        0x3b, // `;`
      ]),
    ],
  ]);
});

test(".toString() が返す文字列を SurrealQL に埋め込む", () => {
  const ReturnQuery = surql`${surql.raw({ toString: () => "RETURN 0" })};`;

  expect(ReturnQuery.text).toBeInstanceOf(EncodedCBOR);
  (ReturnQuery.text as EncodedCBOR).toCBOR(writer);
  expect(writeBytes.mock.calls).toStrictEqual([
    [
      // `RETURN 0;`
      new Uint8Array([
        0b011_01001, // mt: 3, ai: 9
        0x52, // `R`
        0x45, // `E`
        0x54, // `T`
        0x55, // `U`
        0x52, // `R`
        0x4e, // `N`
        0x20, // ` `
        0x30, // `0`
        0x3b, // `;`
      ]),
    ],
  ]);
});

test(".toString() 明示的に定義されていないならエラー", () => {
  expect(() => surql.raw({})).toThrowErrorMatchingSnapshot();
});

test("ID ジェネレーターをエスケープしない", () => {
  const withGenId = new Thing("user", "uuid()");

  expect(String(withGenId)).toBe("user:⟨uuid()⟩");
  expect(String(surql.raw(withGenId))).toBe("user:uuid()");
});

test("ID ジェネレーターをエスケープせずにエンコードする", () => {
  const withGenId = new Thing("user", "uuid()");
  const ReturnQuery = surql`${surql.raw(withGenId)};`;

  expect(ReturnQuery.text).toBeInstanceOf(EncodedCBOR);
  (ReturnQuery.text as EncodedCBOR).toCBOR(writer);
  expect(writeBytes.mock.calls).toStrictEqual([
    [
      // `user:uuid();`
      new Uint8Array([
        0b011_01100, // mt: 3, ai: 12
        0x75, // `u`
        0x73, // `s`
        0x65, // `e`
        0x72, // `r`
        0x3a, // `:`
        0x75, // `u`
        0x75, // `u`
        0x69, // `i`
        0x64, // `d`
        0x28, // `(`
        0x29, // `)`
        0x3b, // `;`
      ]),
    ],
  ]);
});

test("数値を入力してエラー", () => {
  expect(() => surql.raw(0)).toThrowErrorMatchingSnapshot();
});
