import { isTable } from "@tai-kun/surreal";
import { Table as DecodeOnlyTable } from "@tai-kun/surreal/values/decode-only";
import { Table as EncodableTable } from "@tai-kun/surreal/values/encodable";
import { Table } from "@tai-kun/surreal/values/full";
import { Table as StandardTable } from "@tai-kun/surreal/values/standard";
import assert from "@tools/assert";
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

    assert.equal(
      table.toJSON(),
      name,
      name + " の JSON 表現はエスケープされない",
    );
    assert.equal(
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

    assert.equal(
      table.toJSON(),
      name,
      name + " の JSON 表現はエスケープされない",
    );
    assert.equal(
      table.toSurql(),
      "`" + name + "`",
      name + " の Surql 表現はエスケープされる",
    );
  }
});

test("Table クラスであると判定できる", async () => {
  assert(isTable(new DecodeOnlyTable("a")));
  assert(isTable(new EncodableTable("a")));
  assert(isTable(new StandardTable("a")));
  assert(isTable(new Table("a")));

  assert(!isTable("a"));
  assert(!isTable({ name: "a" }));
});
