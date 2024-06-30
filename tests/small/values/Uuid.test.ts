import { isUuid } from "@tai-kun/surrealdb";
import { SurrealDbTypeError } from "@tai-kun/surrealdb/errors";
import { Uuid } from "@tai-kun/surrealdb/full";
import { Uuid as UuidStandard } from "@tai-kun/surrealdb/standard";
import { Uuid as UuidTiny } from "@tai-kun/surrealdb/tiny";
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertThrows,
} from "@tools/assert";
import { test } from "@tools/test";
// @ts-expect-error
import * as uuids from "uuid";

test("UUID v1 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "fe8aab8e-27ba-11ef-9454-0242ac120002";
  const uuid = new Uuid(UUID_STRING);

  assertEquals(uuid.toString(), "fe8aab8e-27ba-11ef-9454-0242ac120002");
  assertEquals(uuid.toJSON(), "fe8aab8e-27ba-11ef-9454-0242ac120002");
  assertEquals(uuid.toSurql(), "u'fe8aab8e-27ba-11ef-9454-0242ac120002'");
  assertEquals(uuid.variant, "RFC");
  assertEquals(uuid.version, 1);
});

test("UUID v4 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee";
  const uuid = new Uuid(UUID_STRING);

  assertEquals(uuid.toString(), "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
  assertEquals(uuid.toJSON(), "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
  assertEquals(uuid.toSurql(), "u'8f3c721e-439a-4fc0-963c-8dbedf5cc7ee'");
  assertEquals(uuid.variant, "RFC");
  assertEquals(uuid.version, 4);
});

test("UUID v7 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "018fb2c0-7bb7-7fca-8308-b24d0be065dc";
  const uuid = new Uuid(UUID_STRING);

  assertEquals(uuid.toString(), "018fb2c0-7bb7-7fca-8308-b24d0be065dc");
  assertEquals(uuid.toJSON(), "018fb2c0-7bb7-7fca-8308-b24d0be065dc");
  assertEquals(uuid.toSurql(), "u'018fb2c0-7bb7-7fca-8308-b24d0be065dc'");
  assertEquals(uuid.variant, "RFC");
  assertEquals(uuid.version, 7);
});

test("Nil UUID から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "00000000-0000-0000-0000-000000000000";
  const uuid = new Uuid(UUID_STRING);

  assertEquals(uuid.toString(), "00000000-0000-0000-0000-000000000000");
  assertEquals(uuid.toJSON(), "00000000-0000-0000-0000-000000000000");
  assertEquals(uuid.toSurql(), "u'00000000-0000-0000-0000-000000000000'");
  assertEquals(uuid.variant, "NIL");
  assertEquals(uuid.version, null);
});

test("Max UUID から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  const uuid = new Uuid(UUID_STRING);

  assertEquals(uuid.toString(), "ffffffff-ffff-ffff-ffff-ffffffffffff");
  assertEquals(uuid.toJSON(), "ffffffff-ffff-ffff-ffff-ffffffffffff");
  assertEquals(uuid.toSurql(), "u'ffffffff-ffff-ffff-ffff-ffffffffffff'");
  assertEquals(uuid.variant, "MAX");
  assertEquals(uuid.version, null);
});

test("バイト配列は常にコピーされる", () => {
  const UUID_STRING = "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee";
  const uuid = new Uuid(UUID_STRING);

  assertNotEquals(uuid.bytes, uuid.bytes);

  for (let i = 0; i < 16; i++) {
    uuid.bytes[i] = 0xff;
  }

  assertEquals(uuid.toJSON(), UUID_STRING);
});

test("UUID クラスであると判定できる", () => {
  assert(isUuid(new Uuid("26c80163-3b83-481b-93da-c473947cccbc")));
  assert(isUuid(new UuidTiny("26c80163-3b83-481b-93da-c473947cccbc")));
  assert(isUuid(new UuidStandard("26c80163-3b83-481b-93da-c473947cccbc")));

  assert(!isUuid("26c80163-3b83-481b-93da-c473947cccbc"));
  assert(!isUuid({}));
});

test("UUID 形式でない文字列から UUID インスタンスを作成すると例外が発生する", () => {
  for (
    const [reason, invalidUuid] of Object.entries({
      "文字数不足": "26c80163-3b83-481b-93da-c473947cccb",
      "バリアントが不正": "26c80163-3b83-481b-03da-c473947cccbc",
      "バージョンが不正": "26c80163-3b83-081b-93da-c473947cccbc",
    })
  ) {
    assertThrows(
      () => new Uuid(invalidUuid),
      SurrealDbTypeError,
      undefined,
      reason,
    );
  }
});

test("バイト配列から UUID インスタンスを作成できる", () => {
  const STRING_UUID = "26c80163-3b83-481b-93da-c473947cccbc";
  const BYTES_UUID = new Uint8Array([
    0x26,
    0xc8,
    0x01,
    0x63,
    // -
    0x3b,
    0x83,
    // -
    0x48,
    0x1b,
    // -
    0x93,
    0xda,
    // -
    0xc4,
    0x73,
    0x94,
    0x7c,
    0xcc,
    0xbc,
  ]);
  const uuidFromString = new Uuid(STRING_UUID);
  const uuidFromBytes = new Uuid(BYTES_UUID);

  assertEquals(uuidFromString.toJSON(), uuidFromBytes.toJSON());
});

test("UUID v1 の文字列を解析できる", () => {
  const uuidString = uuids.v1({
    msecs: new Date("2024-06-01").getTime(),
  });
  const uuid = new Uuid(uuidString);

  assertEquals(uuid.version, 1);
  assertEquals(uuid.timestamp, 1_717_200_000_000);
});

test("UUID v3 の文字列を解析できる", () => {
  const name = "tai-kun";
  const namespace = uuids.v4();
  const uuidString = uuids.v3(name, namespace);
  const uuid = new Uuid(uuidString);

  assertEquals(uuid.version, 3);
  assertEquals(uuid.timestamp, null);
});

test("UUID v4 の文字列を解析できる", () => {
  const uuidString = uuids.v4();
  const uuid = new Uuid(uuidString);

  assertEquals(uuid.version, 4);
  assertEquals(uuid.timestamp, null);
});

test("UUID v5 の文字列を解析できる", () => {
  const name = "tai-kun";
  const namespace = uuids.v4();
  const uuidString = uuids.v5(name, namespace);
  const uuid = new Uuid(uuidString);

  assertEquals(uuid.version, 5);
  assertEquals(uuid.timestamp, null);
});

test("UUID v6 の文字列を解析できる", () => {
  const uuidString = uuids.v6({
    msecs: new Date("2024-06-01").getTime(),
  });
  const uuid = new Uuid(uuidString);

  assertEquals(uuid.version, 6);
  assertEquals(uuid.timestamp, 1_717_200_000_000);
});

// TODO(tai-kun): `msecs` オプションのみの指定ができない。別の方法を考える必要がある。
// test("UUID v7 の文字列を解析できる", () => {
//   const uuidString = uuids.v7({
//     msecs: new Date("2024-06-01").getTime(),
//   });
//   const uuid = new Uuid(uuidString);

//   assertEquals(uuid.version, 7);
//   assertEquals(uuid.timestamp, 1_717_200_000_000);
// });
