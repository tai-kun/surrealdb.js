import { decode, encode } from "@tai-kun/surrealdb/cbor";
import { CBOR_TAG_TABLE, Table } from "@tai-kun/surrealdb/data-types/standard";
import { expect, test } from "vitest";

test(".name", () => {
  const tb = new Table("foo");

  expect(tb.name).toBe("foo");
});

test(".toJSON", () => {
  const tb = new Table("foo-bar");

  expect(tb.toJSON()).toBe("foo-bar");
});

test(".toSurql", () => {
  const tb = new Table("foo-bar");

  expect(tb.toSurql()).toBe("`foo-bar`");
});

test(".toPlainObject", () => {
  const tb = new Table("foo-bar");

  expect(tb.toPlainObject()).toStrictEqual({
    name: "foo-bar",
  });
});

test(".clone", () => {
  class MyTable extends Table {}

  const tb1 = new MyTable("foo-bar");
  const tb2 = tb1.clone();

  expect(tb1).toBeInstanceOf(MyTable);
  expect(tb1).not.toBe(tb2);
  expect(tb1.toString()).toBe(tb2.toString());
});

test(".toCBOR", () => {
  const input = new Table("foo");
  const output = new Table("foo");
  const bytes = encode(input);
  const g = decode(bytes, {
    reviver: {
      tagged(t) {
        switch (t.tag) {
          case CBOR_TAG_TABLE:
            return new Table(t.value as any);

          default:
            return undefined;
        }
      },
    },
  });

  expect(g).toStrictEqual(output);
});
