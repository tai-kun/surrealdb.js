import { Uuid } from "@tai-kun/surrealdb/standard-datatypes";
import * as uuids from "uuid";
import { expect, test } from "vitest";

test("UUID v1 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "fe8aab8e-27ba-11ef-9454-0242ac120002";
  const uuid = new Uuid(UUID_STRING);

  expect(uuid.toString()).toBe("fe8aab8e-27ba-11ef-9454-0242ac120002");
  expect(uuid.toJSON()).toBe("fe8aab8e-27ba-11ef-9454-0242ac120002");
  expect(uuid.toSurql()).toBe("u'fe8aab8e-27ba-11ef-9454-0242ac120002'");
  expect(uuid.variant).toBe("RFC");
  expect(uuid.version).toBe(1);
});

test("UUID v4 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee";
  const uuid = new Uuid(UUID_STRING);

  expect(uuid.toString()).toBe("8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
  expect(uuid.toJSON()).toBe("8f3c721e-439a-4fc0-963c-8dbedf5cc7ee");
  expect(uuid.toSurql()).toBe("u'8f3c721e-439a-4fc0-963c-8dbedf5cc7ee'");
  expect(uuid.variant).toBe("RFC");
  expect(uuid.version).toBe(4);
});

test("UUID v7 形式の文字列から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "018fb2c0-7bb7-7fca-8308-b24d0be065dc";
  const uuid = new Uuid(UUID_STRING);

  expect(uuid.toString()).toBe("018fb2c0-7bb7-7fca-8308-b24d0be065dc");
  expect(uuid.toJSON()).toBe("018fb2c0-7bb7-7fca-8308-b24d0be065dc");
  expect(uuid.toSurql()).toBe("u'018fb2c0-7bb7-7fca-8308-b24d0be065dc'");
  expect(uuid.variant).toBe("RFC");
  expect(uuid.version).toBe(7);
});

test("Nil UUID から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "00000000-0000-0000-0000-000000000000";
  const uuid = new Uuid(UUID_STRING);

  expect(uuid.toString()).toBe("00000000-0000-0000-0000-000000000000");
  expect(uuid.toJSON()).toBe("00000000-0000-0000-0000-000000000000");
  expect(uuid.toSurql()).toBe("u'00000000-0000-0000-0000-000000000000'");
  expect(uuid.variant).toBe("NIL");
  expect(uuid.version).toBe(null);
});

test("Max UUID から UUID インスタンスを作成できる", () => {
  const UUID_STRING = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  const uuid = new Uuid(UUID_STRING);

  expect(uuid.toString()).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
  expect(uuid.toJSON()).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
  expect(uuid.toSurql()).toBe("u'ffffffff-ffff-ffff-ffff-ffffffffffff'");
  expect(uuid.variant).toBe("MAX");
  expect(uuid.version).toBe(null);
});

test("UUID 形式でない文字列から UUID インスタンスを作成すると例外が発生する", () => {
  for (
    const [reason, invalidUuid] of Object.entries({
      "文字数不足": "26c80163-3b83-481b-93da-c473947cccb",
      "文字数過多": "26c80163-3b83-481b-93da-c473947cccbca",
      "バリアントが不正": "26c80163-3b83-481b-03da-c473947cccbc",
      "バージョンが不正": "26c80163-3b83-081b-93da-c473947cccbc",
    })
  ) {
    expect(() => new Uuid(invalidUuid), reason).toThrowError();
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

  expect(uuidFromString.toJSON()).toBe(uuidFromBytes.toJSON());
});

test("UUID v1 の文字列を解析できる", () => {
  const uuidString = uuids.v1({
    msecs: new Date("2024-06-01").getTime(),
  });
  const uuid = new Uuid(uuidString);

  expect(uuid.version).toBe(1);
  expect(uuid.timestamp).toBe(1_717_200_000_000);
});

test("UUID v3 の文字列を解析できる", () => {
  const name = "tai-kun";
  const namespace = uuids.v4();
  const uuidString = uuids.v3(name, namespace);
  const uuid = new Uuid(uuidString);

  expect(uuid.version).toBe(3);
  expect(uuid.timestamp).toBe(null);
});

test("UUID v4 の文字列を解析できる", () => {
  const uuidString = uuids.v4();
  const uuid = new Uuid(uuidString);

  expect(uuid.version).toBe(4);
  expect(uuid.timestamp).toBe(null);
});

test("UUID v5 の文字列を解析できる", () => {
  const name = "tai-kun";
  const namespace = uuids.v4();
  const uuidString = uuids.v5(name, namespace);
  const uuid = new Uuid(uuidString);

  expect(uuid.version).toBe(5);
  expect(uuid.timestamp).toBe(null);
});

test("UUID v6 の文字列を解析できる", () => {
  const uuidString = uuids.v6({
    msecs: new Date("2024-06-01").getTime(),
  });
  const uuid = new Uuid(uuidString);

  expect(uuid.version).toBe(6);
  expect(uuid.timestamp).toBe(1_717_200_000_000);
});

// TODO(tai-kun): uuid v10.0.0 では `msecs` オプションのみの指定でバグあり。
// test("UUID v7 の文字列を解析できる", () => {
//   const uuidString = uuids.v7({
//     msecs: new Date("2024-06-01").getTime(),
//   });
//   const uuid = new Uuid(uuidString);

//   expect(uuid.version).toBe(7);
//   expect(uuid.timestamp).toBe(1_717_200_000_000);
// });

test("v1 と v6 のタイムスタンプを比較できる", () => {
  {
    const uuidv1String = uuids.v1({
      msecs: new Date("2024-06-01").getTime(),
    });
    const uuidv1 = new Uuid(uuidv1String);

    const uuidv6String = uuids.v6({
      msecs: new Date("2024-06-02").getTime(),
    });
    const uuidv6 = new Uuid(uuidv6String);

    expect.soft(uuidv1.compareTo(uuidv6)).toBe(-1);
  }
  {
    const uuidv1String = uuids.v1({
      msecs: new Date("2024-06-02").getTime(),
    });
    const uuidv1 = new Uuid(uuidv1String);

    const uuidv6String = uuids.v6({
      msecs: new Date("2024-06-01").getTime(),
    });
    const uuidv6 = new Uuid(uuidv6String);

    expect.soft(uuidv1.compareTo(uuidv6)).toBe(1);
  }
  {
    const uuidv1String = uuids.v1({
      msecs: new Date("2024-06-01").getTime(),
    });
    const uuidv1 = new Uuid(uuidv1String);

    const uuidv6String = uuids.v6({
      msecs: new Date("2024-06-01").getTime(),
    });
    const uuidv6 = new Uuid(uuidv6String);

    expect.soft(uuidv1.compareTo(uuidv6)).toBe(0);
  }
});

test(".sort() で正しく並び替えられる", () => {
  const uuidv1 = new Uuid("0e004000-2073-11ef-8451-eb2a011f8691");
  const uuidv6 = new Uuid("1ef1fa9e-3968-6000-a77e-683eb1a35ebe");

  const uuidList = [
    uuidv1,
    uuidv6,
  ];
  uuidList.sort((a, b) => a.compareTo(b));

  expect.soft(new Date(uuidv1.timestamp!).toISOString())
    .toBe("2024-06-02T00:00:00.000Z");
  expect.soft(new Date(uuidv6.timestamp!).toISOString())
    .toBe("2024-06-01T00:00:00.000Z");
  expect(uuidList).toStrictEqual([
    uuidv6,
    uuidv1,
  ]);
});
