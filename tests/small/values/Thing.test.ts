import { Thing } from "@tai-kun/surrealdb/full";
import { assertEquals } from "@tools/assert";
import { test } from "@tools/test";

test("ID が半角英数字とアンダースコアのみで構成される", async () => {
  for (
    const id of [
      "a",
      "A",
      "_",
      "0xff",
    ]
  ) {
    const thing = new Thing("tb", id);

    assertEquals(
      thing.toJSON(),
      `tb:${id}`,
      id + " の JSON 表現はエスケープされない",
    );
    assertEquals(
      thing.toSurql(),
      `r'tb:${id}'`,
      id + " の Surql 表現はエスケープされない",
    );
  }
});

test("ID に 10 進数または半角英数字とアンダースコア以外が含まれる場合", async () => {
  for (
    const id of [
      "",
      "123",
      "-123",
      "+123",
      "3.14",
      "abcd-0123",
      "あいうえお😢",
    ]
  ) {
    const thing = new Thing("tb", id);

    assertEquals(
      thing.toJSON(),
      `tb:⟨${id}⟩`,
      id + " の JSON 表現はエスケープされる",
    );
    assertEquals(
      thing.toSurql(),
      `r'tb:⟨${id}⟩'`,
      id + " の Surql 表現はエスケープされる",
    );
  }
});

test("ID が ID ジェネレーターの場合", async () => {
  for (
    const id of [
      "rand()",
      "ulid()",
      "uuid()",
    ]
  ) {
    const thing = new Thing("tb", id);

    assertEquals(
      thing.toJSON(),
      `tb:${id}`,
      id + " の JSON 表現はエスケープされない",
    );
    assertEquals(
      thing.toSurql(),
      `r'tb:${id}'`,
      id + " の Surql 表現はエスケープされない",
    );
  }
});

test("ID が文字列以外の場合", async () => {
  const id = {
    string: "あいうえお😢",
    number: [
      123,
      3.14,
    ],
    bigint: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
    boolean: [
      true,
      false,
    ],
    null: null,
    undefined: undefined,
    date: new Date(0),
  };
  const thing = new Thing("tb", id);

  assertEquals(
    thing.toJSON(),
    `tb:{bigint:9007199254740992,boolean:[true,false],date:d'1970-01-01T00:00:00.000Z',null:NULL,number:[123,3.14],string:s'あいうえお😢',undefined:NONE}`,
  );
  assertEquals(
    thing.toSurql(),
    `r"tb:{bigint:9007199254740992,boolean:[true,false],date:d'1970-01-01T00:00:00.000Z',null:NULL,number:[123,3.14],string:s'あいうえお😢',undefined:NONE}"`,
  );
});
