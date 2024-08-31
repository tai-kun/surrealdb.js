import { isDecimal } from "@tai-kun/surrealdb";
import { decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_STRING_DECIMAL,
  Decimal as EncodableDecimal,
} from "@tai-kun/surrealdb/data-types/encodable";
import { Decimal } from "@tai-kun/surrealdb/data-types/standard";
import { describe, expect, test } from "vitest";

// -----------------------------------------------------------------------------
//
// Decode-only / Encodable Decimal
//
// -----------------------------------------------------------------------------

describe("decode-only/encodable", () => {
  describe("有効な文字列", () => {
    test(".toString()", () => {
      expect((new EncodableDecimal("1.23e1")).toString()).toBe("1.23e1");
    });

    test("テンプレートリテラル", () => {
      expect(`${new EncodableDecimal("1.23e1")}`).toBe("1.23e1");
    });

    test("文字列へ暗黙の型変換", () => {
      expect("" + new EncodableDecimal("1.23e1")).toBe("1.23e1");
    });

    test("数値へ暗黙の型変換", () => {
      expect(+new EncodableDecimal("1.23e1")).toBe(12.3);
    });

    test("CBOR でエンコード/デコードできる", () => {
      const input = new EncodableDecimal("1.23e1");
      const output = new EncodableDecimal("1.23e1");
      const bytes = encode(input);
      const dt = decode(bytes, {
        reviver: {
          tagged(t) {
            switch (t.tag) {
              case CBOR_TAG_STRING_DECIMAL:
                return new EncodableDecimal(t.value as any);

              default:
                return undefined;
            }
          },
        },
      });

      expect(dt).toStrictEqual(output);
    });

    test(".toJSON()", () => {
      const json = new EncodableDecimal("1.23e1").toJSON();

      expect(json).toBe("1.23e1");
    });

    test(".toSurql()", () => {
      const surql = new EncodableDecimal("1.23e1").toSurql();

      expect(surql).toBe("1.23e1dec");
    });

    test(".toPlain()", () => {
      const toPlain = new EncodableDecimal("1.23e1").toPlain();

      expect(toPlain).toStrictEqual({
        value: "1.23e1",
      });
    });
  });

  describe("無効な文字列", () => {
    test("インスタンスの作成に失敗する", () => {
      expect(() => new EncodableDecimal("+3.14"))
        .toThrowErrorMatchingSnapshot();
    });
  });
});

// -----------------------------------------------------------------------------
//
// Standard Decimal
//
// -----------------------------------------------------------------------------

describe("standard", () => {
  describe("有効な文字列", () => {
    test(".toString()", () => {
      expect((new Decimal("1.23e1")).toString()).toBe("12.3");
    });

    test("テンプレートリテラル", () => {
      expect(`${new Decimal("1.23e1")}`).toBe("12.3");
    });

    test("文字列へ暗黙の型変換", () => {
      expect("" + new Decimal("1.23e1")).toBe("12.3");
    });

    test("数値へ暗黙の型変換", () => {
      expect(+new Decimal("1.23e1")).toBe(12.3);
    });

    test("CBOR でエンコード/デコードできる", () => {
      const input = new Decimal("1.23e1");
      const output = new Decimal("1.23e1");
      const bytes = encode(input);
      const dt = decode(bytes, {
        reviver: {
          tagged(t) {
            switch (t.tag) {
              case CBOR_TAG_STRING_DECIMAL:
                return new Decimal(t.value as any);

              default:
                return undefined;
            }
          },
        },
      });

      expect(dt).toStrictEqual(output);
    });

    test(".toJSON()", () => {
      const json = new Decimal("1.23e1").toJSON();

      expect(json).toBe("12.3");
    });

    test(".toSurql()", () => {
      const surql = new Decimal("1.23e1").toSurql();

      expect(surql).toBe("12.3dec");
    });

    test(".toPlain()", () => {
      const toPlain = new Decimal("1.23e1").toPlain();

      expect(toPlain).toStrictEqual({
        value: "12.3",
        exponent: 1,
        sign: 1,
        singleDigits: [
          1,
          2,
          3,
        ],
      });
    });
  });

  describe("無効な文字列", () => {
    test("インスタンスの作成に失敗する", () => {
      expect(() => new Decimal("+3.14"))
        .toThrowErrorMatchingSnapshot();
    });
  });

  describe("有効な数値", () => {
    test(".toString()", () => {
      expect((new Decimal(3.14)).toString()).toBe("3.14");
    });

    test("テンプレートリテラル", () => {
      expect(`${new Decimal(3.14)}`).toBe("3.14");
    });

    test("文字列へ暗黙の型変換", () => {
      expect("" + new Decimal(3.14)).toBe("3.14");
    });

    test("数値へ暗黙の型変換", () => {
      expect(+new Decimal(3.14)).toBe(3.14);
    });

    test("CBOR でエンコード/デコードできる", () => {
      const input = new Decimal(3.14);
      const output = new Decimal(3.14);
      const bytes = encode(input);
      const dt = decode(bytes, {
        reviver: {
          tagged(t) {
            switch (t.tag) {
              case CBOR_TAG_STRING_DECIMAL:
                return new Decimal(t.value as any);

              default:
                return undefined;
            }
          },
        },
      });

      expect(dt).toStrictEqual(output);
    });

    test(".toJSON()", () => {
      const json = new Decimal(3.14).toJSON();

      expect(json).toBe("3.14");
    });

    test(".toSurql()", () => {
      const surql = new Decimal(3.14).toSurql();

      expect(surql).toBe("3.14dec");
    });

    test(".toPlain()", () => {
      const toPlain = new Decimal(3.14).toPlain();

      expect(toPlain).toStrictEqual({
        value: "3.14",
        exponent: 0,
        sign: 1,
        singleDigits: [
          3,
          1,
          4,
        ],
      });
    });
  });

  describe("無効な数値", () => {
    test("インスタンスの作成に失敗する", () => {
      expect(() => new Decimal(NaN))
        .toThrowErrorMatchingSnapshot();
    });
  });
});

test("big.js の静的プロパティーにアクセスできる", () => {
  expect(Decimal.DP).toBeTypeOf("number");
});

test("big.js のインスタンスメソッドにアクセスできる", () => {
  const d = new Decimal("0.1")
    .plus("0.1")
    .plus(new Decimal("0.1"));

  expect(d).toBeInstanceOf(Decimal);
  expect(String(d)).toBe("0.3");
});

test("Decimal であると判定できる", () => {
  expect(isDecimal(new EncodableDecimal("0"))).toBe(true);
  expect(isDecimal(new Decimal(0))).toBe(true);
  expect(isDecimal("0")).toBe(false);
  expect(isDecimal(0)).toBe(false);
});
