import { isDecimal } from "@tai-kun/surrealdb";
import { decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_STRING_DECIMAL,
  Decimal as EncodableDecimal,
} from "@tai-kun/surrealdb/data-types/encodable";
import { Decimal } from "@tai-kun/surrealdb/data-types/standard";
import { describe, expect, test } from "vitest";

type Suite = {
  args: [any];
  string?: never;
  number?: never;
} | {
  args: [any];
  string: string;
  number: number;
};

// -----------------------------------------------------------------------------
//
// Decode-only / Encodable Datetime
//
// -----------------------------------------------------------------------------

describe("decode-only/encodable", () => {
  const suites: Record<string, Suite> = {
    "有効な文字列": {
      args: ["1.23e1"],
      string: "1.23e1",
      number: 12.3,
    },
    "無効な文字列": {
      args: ["+3.14"],
    },
  };

  for (const [t, c] of Object.entries(suites)) {
    describe(t, () => {
      test("インスタンスの作成に失敗する", { skip: "string" in c }, () => {
        expect(() => new EncodableDecimal(...c.args))
          .toThrowError("[big.js] Invalid number");
      });

      test("文字列", { skip: !("string" in c) }, () => {
        expect(String(new EncodableDecimal(...c.args))).toBe(c.string);
      });

      test(
        "CBOR でエンコード/デコードできる",
        { skip: !("string" in c) },
        () => {
          const input = new EncodableDecimal(...c.args);
          const output = new EncodableDecimal(...c.args);
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
        },
      );
    });
  }
});

// -----------------------------------------------------------------------------
//
// Standard Datetime
//
// -----------------------------------------------------------------------------

describe("standard", () => {
  const suites: Record<string, Suite> = {
    "有効な文字列": {
      args: ["1.23e1"],
      string: "12.3",
      number: 12.3,
    },
    "無効な文字列": {
      args: ["+3.14"],
    },
    "有効な数値": {
      args: [3.14],
      string: "3.14",
      number: 3.14,
    },
    "無効な数値": {
      args: [NaN],
    },
  };

  for (const [t, c] of Object.entries(suites)) {
    describe(t, () => {
      test("インスタンスの作成に失敗する", { skip: "string" in c }, () => {
        expect(() => new Decimal(...c.args))
          .toThrowError("[big.js] Invalid number");
      });

      test("文字列", { skip: !("string" in c) }, () => {
        expect(String(new Decimal(...c.args))).toBe(c.string);
      });

      test("数値", { skip: !("number" in c) }, () => {
        const d = new Decimal(...c.args);

        expect(d.toNumber()).toBe(c.number);
        expect(+d).toBe(c.number);
      });

      test(
        "CBOR でエンコード/デコードできる",
        { skip: !("string" in c) },
        () => {
          const input = new Decimal(...c.args);
          const output = new Decimal(...c.args);
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
        },
      );
    });
  }
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
