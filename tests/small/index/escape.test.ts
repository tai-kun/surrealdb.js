import { escapeIdent, escapeKey, escapeRid, quoteStr } from "@tai-kun/surreal";
import assert from "@tools/assert";
import { test } from "@tools/test";

test("quoteStr", () => {
  for (
    const [str, expect] of [
      ["cat", "'cat'"],
      ["cat's", `"cat's"`],
      [`cat's "toy"`, `"cat's \"toy\""`],
    ] satisfies [any, any][]
  ) {
    assert.equal(quoteStr(str), expect);
  }
});

test("escapeKey", () => {
  for (
    const [str, expect] of [
      ["123", "123"],
      ["foo_bar", "foo_bar"],
      ["foo-bar", `"foo-bar"`],
      [`ehco "hello"`, `"ehco \"hello\""`],
    ] satisfies [any, any][]
  ) {
    assert.equal(escapeKey(str), expect);
  }
});

test("escapeRid", () => {
  for (
    const [str, expect] of [
      ["123", "⟨123⟩"],
      ["foo_bar", "foo_bar"],
      ["foo-bar", "⟨foo-bar⟩"],
      ["ehco ⟩", "⟨ehco \⟩⟩"],
    ] satisfies [any, any][]
  ) {
    assert.equal(escapeRid(str), expect);
  }
});

test("escapeIdent", () => {
  for (
    const [str, expect] of [
      ["123", "`123`"],
      ["foo_bar", "foo_bar"],
      ["foo-bar", "`foo-bar`"],
      ["ehco `hello`", "`ehco \`hello\``"],
    ] satisfies [any, any][]
  ) {
    assert.equal(escapeIdent(str), expect);
  }
});
