import { CONTINUE, decode, encode } from "@tai-kun/surrealdb/cbor";
import {
  CBOR_TAG_RECORDID,
  Thing,
} from "@tai-kun/surrealdb/data-types/standard";
import { expect, test } from "vitest";

test(".tb, .id", () => {
  const t = new Thing("foo", "bar");

  expect(t.tb).toBe("foo");
  expect(t.id).toBe("bar");
});

test(".toJSON", () => {
  const t = new Thing("foo", "bar");

  expect(t.toJSON()).toBe("foo:bar");
});

test(".toSurql", () => {
  const t = new Thing("foo", "bar");

  expect(t.toSurql()).toBe("r'foo:bar'");
});

test(".clone", () => {
  class MyThing extends Thing {}

  const t1 = new MyThing("foo", "bar");
  const t2 = t1.clone();

  expect(t1).toBeInstanceOf(MyThing);
  expect(t1).not.toBe(t2);
  expect(t1.toString()).toBe(t2.toString());
});

test(".toString(-0)", () => {
  const t = new Thing("", -0);

  expect(`${t}`).toBe("⟨⟩:⟨-0⟩");
});

test(".toString(0)", () => {
  const t = new Thing("", 0);

  expect(`${t}`).toBe("⟨⟩:0");
});

test(".toString(0n)", () => {
  const t = new Thing("", 0n);

  expect(`${t}`).toBe("⟨⟩:0");
});

test(".toString(-1n)", () => {
  const t = new Thing("", -1n);

  expect(`${t}`).toBe("⟨⟩:⟨-1⟩");
});

test(".toString(foo-bar)", () => {
  const t = new Thing("", "foo-bar");

  expect(`${t}`).toBe("⟨⟩:⟨foo-bar⟩");
});

test(".toString({ ... })", () => {
  const t = new Thing("", {
    string: "😢",
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
  });

  expect(`${t}`).toBe(
    "⟨⟩:{bigint:9007199254740992,boolean:[true,false],date:d'1970-01-01T00:00:00.000Z',null:NULL,number:[123,3.14],string:'😢',undefined:NONE}",
  );
});

test(".toCBOR", () => {
  const input = new Thing("foo", {
    string: "😢",
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
  });
  const output = new Thing("foo", {
    string: "😢",
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
  });
  const bytes = encode(input);
  const t = decode(bytes, {
    reviver: {
      tagged(t) {
        switch (t.tag) {
          case CBOR_TAG_RECORDID:
            return new Thing(t.value as any);

          default:
            return CONTINUE;
        }
      },
    },
  });

  expect(t).toStrictEqual(output);
});
