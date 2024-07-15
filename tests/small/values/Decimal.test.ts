import { isDecimal } from "@tai-kun/surreal/values";
import { Decimal as DecodeOnlyDecimal } from "@tai-kun/surreal/values/decode-only";
import { Decimal as EncodableDecimal } from "@tai-kun/surreal/values/encodable";
import { Decimal as FullDecimal } from "@tai-kun/surreal/values/full";
import { Decimal as StandardDecimal } from "@tai-kun/surreal/values/standard";
import assert from "@tools/assert";
import { describe, test } from "@tools/test";

const tests = {
  DecodeOnlyDecimal,
  EncodableDecimal,
  StandardDecimal,
  FullDecimal,
};

const isNotDecodeOnlyDecimal = (x: unknown): x is
  | typeof EncodableDecimal
  | typeof StandardDecimal
  | typeof FullDecimal => x !== DecodeOnlyDecimal;

for (const [name, Decimal] of Object.entries(tests)) {
  describe(name, () => {
    test("文字列から Decimal を作成する", () => {
      const d = new Decimal("3.14");

      assert(d instanceof Decimal);
      assert.equal(d.valueOf(), "3.14");
    });

    test("数値から Decimal を作成する", () => {
      const d = new Decimal(3.14);

      assert(d instanceof Decimal);
      assert.equal(d.valueOf(), "3.14");
    });

    test("Decimal クラスであると判定できる", () => {
      assert(isDecimal(new Decimal("3.14")));
      assert(!isDecimal(3.14));
      assert(!isDecimal("3.14"));
    });

    if (!isNotDecodeOnlyDecimal(Decimal)) {
      return;
    }

    test("数値に変換", () => {
      assert.equal(+new Decimal("3.14"), 3.14, "`+<Decimal>`");
      assert.equal(Number(new Decimal("3.14")), 3.14, "`Number(Decimal)`");
    });

    test("整数長に変換", () => {
      const d = new Decimal("9007199254740992"); // Number.MAX_SAFE_INTEGER + 1

      assert.equal(BigInt(d as any), 9007199254740992n);
    });

    test("文字列表現", () => {
      assert.equal(new Decimal(3.14).toString(), "3.14");
    });

    test("テンプレート", () => {
      assert.equal(`${new Decimal(3.14)}`, "3.14");
    });

    test("JSON 表現", () => {
      assert.equal(new Decimal(3.14).toJSON(), "3.14");
    });

    test("SurrealQL 表現", () => {
      assert.equal(new Decimal(3.14).toSurql(), "3.14dec");
    });

    test("decimal.js-light の静的メソッドにアクセスできる", {
      skip: Decimal !== StandardDecimal,
    }, () => {
      assert.equal(
        typeof (Decimal as typeof StandardDecimal).ROUND_CEIL,
        "number",
      );
    });

    test("decimal.js-light のインスタンスメソッドにアクセスできる", {
      skip: Decimal !== StandardDecimal,
    }, () => {
      const d = new (Decimal as typeof StandardDecimal)("0.1")
        .plus("0.1")
        .plus("0.1");

      assert.equal(d.valueOf(), "0.3");
      assert(d instanceof StandardDecimal);
      assert(isDecimal(d));
    });

    test("decimal.js の静的メソッドにアクセスできる", {
      skip: Decimal !== FullDecimal,
    }, () => {
      assert.equal(
        typeof (Decimal as typeof FullDecimal).ROUND_CEIL,
        "number",
      );
    });

    test("decimal.js のインスタンスメソッドにアクセスできる", {
      skip: Decimal !== FullDecimal,
    }, () => {
      const d = new (Decimal as typeof FullDecimal)("0.1")
        .plus("0.1")
        .plus("0.1");

      assert.equal(d.valueOf(), "0.3");
      assert(d instanceof Decimal);
      assert(isDecimal(d));
    });
  });
}
