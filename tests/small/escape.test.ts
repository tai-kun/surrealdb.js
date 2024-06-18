import {
  escapeIdent,
  escapeKey,
  escapeRid,
  quoteStr,
} from "@tai-kun/surrealdb";
import { assertEquals } from "@tools/assert";
import { test } from "@tools/test";

test("quoteStr", () => {
  for (
    const [str, expect] of [
      ["cat", "'cat'"],
      ["cat's", `"cat's"`],
      [`cat's "toy"`, `"cat's \"toy\""`],
    ] satisfies [any, any][]
  ) {
    assertEquals(quoteStr(str), expect);
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
    assertEquals(escapeKey(str), expect);
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
    assertEquals(escapeRid(str), expect);
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
    assertEquals(escapeIdent(str), expect);
  }
});
