import {
  escapeIdent,
  escapeKey,
  escapeRid,
  quoteStr,
} from "@tai-kun/surreal/utils";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("quoteStr", () => {
  const tests: [string, string][] = [
    ["cat", "'cat'"],
    ["cat's", `"cat's"`],
    [`cat's "toy"`, `"cat's \"toy\""`],
  ];

  for (const [str, expect] of tests) {
    assert.equal(quoteStr(str), expect);
  }
});

test("escapeKey", () => {
  const tests: [string, string][] = [
    ["123", "123"],
    ["foo_bar", "foo_bar"],
    ["foo-bar", `"foo-bar"`],
    [`ehco "hello"`, `"ehco \"hello\""`],
  ];

  for (const [str, expect] of tests) {
    assert.equal(escapeKey(str), expect);
  }
});

test("escapeRid", () => {
  const tests: [string, string][] = [
    ["123", "⟨123⟩"],
    ["foo_bar", "foo_bar"],
    ["foo-bar", "⟨foo-bar⟩"],
    ["ehco ⟩", "⟨ehco \⟩⟩"],
  ];

  for (const [str, expect] of tests) {
    assert.equal(escapeRid(str), expect);
  }
});

test("escapeIdent", () => {
  const tests: [string, string][] = [
    ["123", "`123`"],
    ["foo_bar", "foo_bar"],
    ["foo-bar", "`foo-bar`"],
    ["ehco `hello`", "`ehco \`hello\``"],
  ];

  for (const [str, expect] of tests) {
    assert.equal(escapeIdent(str), expect);
  }
});
