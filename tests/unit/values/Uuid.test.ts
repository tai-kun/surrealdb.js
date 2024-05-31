"use prelude";

import { isUuid, Uuid as NormalUuid } from "@tai-kun/surrealdb";
import { Uuid } from "@tai-kun/surrealdb/full";
import { Uuid as TinyUuid } from "@tai-kun/surrealdb/tiny";

test("should check if a value is a uuid", () => {
  assert(isUuid(new Uuid("26c80163-3b83-481b-93da-c473947cccbc")));
  assert(isUuid(new TinyUuid("26c80163-3b83-481b-93da-c473947cccbc")));
  assert(isUuid(new NormalUuid("26c80163-3b83-481b-93da-c473947cccbc")));
  assert(!isUuid("26c80163-3b83-481b-93da-c473947cccbc"));
  assert(!isUuid({}));
});

test("should parse a uuid v4 string", () => {
  const UUID_STRING = "8f3c721e-439a-4fc0-963c-8dbedf5cc7ee";
  const uuid = new Uuid(UUID_STRING);

  assertEquals(uuid.toString(), UUID_STRING);
  assertEquals(uuid.version, 4);
});

test("should parse a uuid v7 string", () => {
  const UUID_STRING = "018fb2c0-7bb7-7fca-8308-b24d0be065dc";
  const uuid = new Uuid(UUID_STRING);

  assertEquals(uuid.toString(), UUID_STRING);
  assertEquals(uuid.version, 7);
});

test("should throw on uuid v1 string", () => {
  const UUID_STRING = "a2c69f6a-1b08-11ef-9262-0242ac120002";

  assertThrows(
    () => {
      new Uuid(UUID_STRING);
    },
    Error,
    "Invalid UUID: a2c69f6a-1b08-11ef-9262-0242ac120002",
  );
});

test("should throw on nil uuid string", () => {
  const UUID_STRING = "00000000-0000-0000-0000-000000000000";

  assertThrows(
    () => {
      new Uuid(UUID_STRING);
    },
    Error,
    "Invalid UUID: 00000000-0000-0000-0000-000000000000",
  );
});
