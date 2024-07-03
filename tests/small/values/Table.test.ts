import { isTable } from "@tai-kun/surreal";
import { Table } from "@tai-kun/surreal/values/full";
import { Table as TableStandard } from "@tai-kun/surreal/values/standard";
import { Table as TableTiny } from "@tai-kun/surreal/values/tiny";
import { assert, assertEquals } from "@tools/assert";
import { test } from "@tools/test";

test("半角英数字とアンダースコアのみで構成される", async () => {
  for (
    const name of [
      "a",
      "A",
      "_",
      "0xff",
    ]
  ) {
    const table = new Table(name);

    assertEquals(
      table.toJSON(),
      name,
      name + " の JSON 表現はエスケープされない",
    );
    assertEquals(
      table.toSurql(),
      name,
      name + " の Surql 表現はエスケープされない",
    );
  }
});

test("10 進数または半角英数字とアンダースコア以外が含まれる場合", async () => {
  for (
    const name of [
      "",
      "123",
      "-123",
      "+123",
      "3.14",
      "abcd-0123",
      "あいうえお😢",
    ]
  ) {
    const table = new Table(name);

    assertEquals(
      table.toJSON(),
      name,
      name + " の JSON 表現はエスケープされない",
    );
    assertEquals(
      table.toSurql(),
      "`" + name + "`",
      name + " の Surql 表現はエスケープされる",
    );
  }
});

test("Table クラスであると判定できる", async () => {
  assert(isTable(new Table("a")));
  assert(isTable(new TableTiny("a")));
  assert(isTable(new TableStandard("a")));

  assert(!isTable("a"));
  assert(!isTable({ name: "a" }));
});
