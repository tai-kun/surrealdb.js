import {
  escapeIdent,
  escapeKey,
  escapeRid,
  quoteStr,
} from "@tai-kun/surreal/utils";
import { describe, expect, test } from "vitest";

describe("仕様確認", () => {
  describe("サロゲートペア", () => {
    test("`𩸽` の長さは 2", () => {
      expect("𩸽".length).toBe(2);
    });

    test(".replaceAll で元の文字が崩れない", () => {
      expect("'𩸽'".replaceAll("'", "_")).toBe("_𩸽_");
    });
  });

  describe("異体字セレクター", () => {
    test("`👍🏽` の長さは 4", () => {
      expect("👍🏽".length).toBe(4);
    });

    test(".replaceAll で元の文字が崩れない", () => {
      expect("'👍🏽'".replaceAll("'", "_")).toBe("_👍🏽_");
    });
  });

  describe("結合文字", () => {
    test("`パ` の長さは 2", () => {
      expect("パ".length).toBe(2);
    });

    test(".replaceAll で元の文字が崩れない", () => {
      expect("'パ'".replaceAll("'", "_")).toBe("_パ_");
    });
  });
});

describe("quoteStr", () => {
  test.for<[input: string, expected: string]>([
    // ASCII
    [``, `''`],
    [`cat`, `'cat'`],
    [`cat's`, `"cat's"`],
    [`cat's "toy"`, `"cat's \\"toy\\""`],
    [`'\\"\\`, `"'\\\\\\"\\\\"`],
    // サロゲートペア
    [`𩸽`, `'𩸽'`],
    [`𩸽's`, `"𩸽's"`],
    [`𩸽's "feed"`, `"𩸽's \\"feed\\""`],
    // 異体字セレクター
    [`👍🏽`, `'👍🏽'`],
    [`👍🏽'`, `"👍🏽'"`],
    [`'👍🏽"`, `"'👍🏽\\""`],
    // 結合文字
    [`パ`, `'パ'`],
    [`パ'`, `"パ'"`],
    [`'パ"`, `"'パ\\""`],
  ])("%s -> %s", ([input, expected], { expect }) => {
    expect(quoteStr(input)).toBe(expected);
  });
});

describe("escapeKey", () => {
  test.for<[input: string, expected: string]>([
    // ASCII
    [``, `""`],
    [`123`, `123`],
    [`foo_bar`, `foo_bar`],
    [`foo-bar`, `"foo-bar"`],
    [`ehco "hello"`, `"ehco \\"hello\\""`],
    [`'\\"\\`, `"'\\\\"\\"`],
    // サロゲートペア
    [`𩸽`, `"𩸽"`],
    [`𩸽's "feed"`, `"𩸽's \\"feed\\""`],
    // 異体字セレクター
    [`👍🏽`, `"👍🏽"`],
    [`'👍🏽"`, `"'👍🏽\\""`],
    // 結合文字
    [`パ`, `"パ"`],
    [`'パ"`, `"'パ\\""`],
  ])("%s -> %s", ([input, expected], { expect }) => {
    expect(escapeKey(input)).toBe(expected);
  });
});

describe("escapeRid", () => {
  test.for<[input: string, expected: string]>([
    // ASCII
    [``, `⟨⟩`],
    [`123`, `⟨123⟩`],
    [`foo_bar`, `foo_bar`],
    [`foo-bar`, `⟨foo-bar⟩`],
    [`ehco ⟩`, `⟨ehco \\⟩⟩`],
    // サロゲートペア
    [`𩸽`, `⟨𩸽⟩`],
    [`𩸽's ⟨feed⟩`, `⟨𩸽's ⟨feed\\⟩⟩`],
    // 異体字セレクター
    [`👍🏽`, `⟨👍🏽⟩`],
    [`'👍🏽⟩`, `⟨'👍🏽\\⟩⟩`],
    // 結合文字
    [`パ`, `⟨パ⟩`],
    [`'パ⟩`, `⟨'パ\\⟩⟩`],
  ])("%s -> %s", ([input, expected], { expect }) => {
    expect(escapeRid(input)).toBe(expected);
  });
});

describe("escapeIdent", () => {
  test.for<[input: string, expected: string]>([
    // ASCII
    ["", "``"],
    ["123", "`123`"],
    ["foo_bar", "foo_bar"],
    ["foo-bar", "`foo-bar`"],
    ["ehco `hello`", "`ehco \\`hello\\``"],
    // サロゲートペア
    ["𩸽", "`𩸽`"],
    ["𩸽's `feed`", "`𩸽's \\`feed\\``"],
    // 異体字セレクター
    ["👍🏽", "`👍🏽`"],
    ["`👍🏽", "`\\`👍🏽`"],
    // 結合文字
    ["パ", "`パ`"],
    ["`パ", "`\\`パ`"],
  ])("%s -> %s", ([input, expected], { expect }) => {
    expect(escapeIdent(input)).toBe(expected);
  });
});
