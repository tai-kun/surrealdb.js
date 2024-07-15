import { SurrealTypeError } from "@tai-kun/surreal/errors";
import { isUuid } from "@tai-kun/surreal/values";
import { Uuid as DecodeOnlyUuid } from "@tai-kun/surreal/values/decode-only";
import { Uuid as EncodableUuid } from "@tai-kun/surreal/values/encodable";
import { Uuid } from "@tai-kun/surreal/values/full";
import { Uuid as UuidStandard } from "@tai-kun/surreal/values/standard";
import assert from "@tools/assert";
import { test } from "@tools/test";
// @ts-expect-error
import * as uuids from "uuid";

test("UUID v1 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "fe8aab8e-27ba-11ef-9454-0242ac120002";
  const uuid = new Uuid(UUID_STRING);

  assert.equal(uuid.toString(), "fe8aab8e-27ba-11ef-9454-0242ac120002");
  assert.equal(uuid.toJSON(), "fe8aab8e-27ba-11ef-9454-0242ac120002");
  assert.equal(uuid.toSurql(), "u'fe8aab8e-27ba-11ef-9454-0242ac120002'");
  assert.equal(uuid.variant, "RFC");
  assert.equal(uuid.version, 1);
});

test("UUID v4 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee";
  const uuid = new Uuid(UUID_STRING);

  assert.equal(uuid.toString(), "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
  assert.equal(uuid.toJSON(), "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
  assert.equal(uuid.toSurql(), "u'8f3c721e-439a-4fc0-963c-8dbedf5cc7ee'");
  assert.equal(uuid.variant, "RFC");
  assert.equal(uuid.version, 4);
});

test("UUID v7 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "018fb2c0-7bb7-7fca-8308-b24d0be065dc";
  const uuid = new Uuid(UUID_STRING);

  assert.equal(uuid.toString(), "018fb2c0-7bb7-7fca-8308-b24d0be065dc");
  assert.equal(uuid.toJSON(), "018fb2c0-7bb7-7fca-8308-b24d0be065dc");
  assert.equal(uuid.toSurql(), "u'018fb2c0-7bb7-7fca-8308-b24d0be065dc'");
  assert.equal(uuid.variant, "RFC");
  assert.equal(uuid.version, 7);
});

test("Nil UUID から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "00000000-0000-0000-0000-000000000000";
  const uuid = new Uuid(UUID_STRING);

  assert.equal(uuid.toString(), "00000000-0000-0000-0000-000000000000");
  assert.equal(uuid.toJSON(), "00000000-0000-0000-0000-000000000000");
  assert.equal(uuid.toSurql(), "u'00000000-0000-0000-0000-000000000000'");
  assert.equal(uuid.variant, "NIL");
  assert.equal(uuid.version, null);
});

test("Max UUID から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  const uuid = new Uuid(UUID_STRING);

  assert.equal(uuid.toString(), "ffffffff-ffff-ffff-ffff-ffffffffffff");
  assert.equal(uuid.toJSON(), "ffffffff-ffff-ffff-ffff-ffffffffffff");
  assert.equal(uuid.toSurql(), "u'ffffffff-ffff-ffff-ffff-ffffffffffff'");
  assert.equal(uuid.variant, "MAX");
  assert.equal(uuid.version, null);
});

// test("バイト配列は常にコピーされる", () => {
//   const UUID_STRING = "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee";
//   const uuid = new Uuid(UUID_STRING);

//   assert.notEqual(uuid.bytes, uuid.bytes);

//   for (let i = 0; i < 16; i++) {
//     uuid.bytes[i] = 0xff;
//   }

//   assert.equal(uuid.toJSON(), UUID_STRING);
// });

test("UUID クラスであると判定できる", () => {
  assert(isUuid(new DecodeOnlyUuid("26c80163-3b83-481b-93da-c473947cccbc")));
  assert(isUuid(new EncodableUuid("26c80163-3b83-481b-93da-c473947cccbc")));
  assert(isUuid(new UuidStandard("26c80163-3b83-481b-93da-c473947cccbc")));
  assert(isUuid(new Uuid("26c80163-3b83-481b-93da-c473947cccbc")));

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
    assert.throws(
      () => new Uuid(invalidUuid),
      SurrealTypeError,
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

  assert.equal(uuidFromString.toJSON(), uuidFromBytes.toJSON());
});

test("UUID v1 の文字列を解析できる", () => {
  const uuidString = uuids.v1({
    msecs: new Date("2024-06-01").getTime(),
  });
  const uuid = new Uuid(uuidString);

  assert.equal(uuid.version, 1);
  assert.equal(uuid.timestamp, 1_717_200_000_000);
});

test("UUID v3 の文字列を解析できる", () => {
  const name = "tai-kun";
  const namespace = uuids.v4();
  const uuidString = uuids.v3(name, namespace);
  const uuid = new Uuid(uuidString);

  assert.equal(uuid.version, 3);
  assert.equal(uuid.timestamp, null);
});

test("UUID v4 の文字列を解析できる", () => {
  const uuidString = uuids.v4();
  const uuid = new Uuid(uuidString);

  assert.equal(uuid.version, 4);
  assert.equal(uuid.timestamp, null);
});

test("UUID v5 の文字列を解析できる", () => {
  const name = "tai-kun";
  const namespace = uuids.v4();
  const uuidString = uuids.v5(name, namespace);
  const uuid = new Uuid(uuidString);

  assert.equal(uuid.version, 5);
  assert.equal(uuid.timestamp, null);
});

test("UUID v6 の文字列を解析できる", () => {
  const uuidString = uuids.v6({
    msecs: new Date("2024-06-01").getTime(),
  });
  const uuid = new Uuid(uuidString);

  assert.equal(uuid.version, 6);
  assert.equal(uuid.timestamp, 1_717_200_000_000);
});

// TODO(tai-kun): `msecs` オプションのみの指定ができない。別の方法を考える必要がある。
// test("UUID v7 の文字列を解析できる", () => {
//   const uuidString = uuids.v7({
//     msecs: new Date("2024-06-01").getTime(),
//   });
//   const uuid = new Uuid(uuidString);

//   assert.equal(uuid.version, 7);
//   assert.equal(uuid.timestamp, 1_717_200_000_000);
// });
