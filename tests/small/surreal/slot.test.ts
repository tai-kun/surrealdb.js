import { surql } from "@tai-kun/surrealdb";
import type { Writer } from "@tai-kun/surrealdb/cbor";
import type { InferSlotVars } from "@tai-kun/surrealdb/clients/standard";
import { Encoded, EncodedCBOR } from "@tai-kun/surrealdb/formatter";
import { expect, expectTypeOf, test, vi } from "vitest";

test("unknown 型の必須スロット", () => {
  const slot = surql.slot("foo");
  type TSlot = typeof slot;

  expectTypeOf<TSlot["name"]>().toEqualTypeOf<"foo">();
  expectTypeOf<TSlot["isRequired"]>().toEqualTypeOf<true>();
  expectTypeOf<TSlot["defaultValue"]>().toEqualTypeOf<unknown>();
  expectTypeOf<InferSlotVars<TSlot>>().toEqualTypeOf<{
    readonly foo: unknown;
  }>();

  expect(slot.name).toBe("foo");
  expect(slot.isRequired).toBe(true);
  expect(slot).not.toHaveProperty("defaultValue");
});

test("unknown 型のオプショナルスロット", () => {
  const slot = surql.slot("foo").optional();
  type TSlot = typeof slot;

  expectTypeOf<TSlot["name"]>().toEqualTypeOf<"foo">();
  expectTypeOf<TSlot["isRequired"]>().toEqualTypeOf<false>();
  expectTypeOf<TSlot["defaultValue"]>().toEqualTypeOf<unknown>();
  expectTypeOf<InferSlotVars<TSlot>>().toEqualTypeOf<{
    readonly foo?: unknown;
  }>();

  expect(slot.name).toBe("foo");
  expect(slot.isRequired).toBe(false);
  expect(slot).not.toHaveProperty("defaultValue");
});

test("デフォルト値を設定するとオプショナルになる", () => {
  const slot = surql.slot("foo", 42);
  type TSlot = typeof slot;

  expectTypeOf<TSlot["name"]>().toEqualTypeOf<"foo">();
  expectTypeOf<TSlot["isRequired"]>().toEqualTypeOf<false>();
  expectTypeOf<TSlot["defaultValue"]>()
    .toEqualTypeOf<number | Encoded<number> | undefined>();
  expectTypeOf<InferSlotVars<TSlot>>().toEqualTypeOf<{
    readonly foo?: number | Encoded<number>;
  }>();

  expect(slot.name).toBe("foo");
  expect(slot.isRequired).toBe(false);
  expect(slot).toHaveProperty("defaultValue");

  const writeBytes = vi.fn();
  const writer = { writeBytes } as unknown as Writer;

  expect(slot.defaultValue).toBeInstanceOf(EncodedCBOR);
  (slot.defaultValue as EncodedCBOR).toCBOR(writer);
  expect(writeBytes.mock.calls).toStrictEqual([
    [
      // `42`
      new Uint8Array([
        0x18,
        0x2a,
      ]),
    ],
  ]);
});

test("型を変更する", () => {
  const slot = surql.slot("foo").type<number>();
  type TSlot = typeof slot;

  expectTypeOf<TSlot["name"]>().toEqualTypeOf<"foo">();
  expectTypeOf<TSlot["isRequired"]>().toEqualTypeOf<true>();
  expectTypeOf<TSlot["defaultValue"]>()
    .toEqualTypeOf<number | Encoded<number> | undefined>();
  expectTypeOf<InferSlotVars<TSlot>>().toEqualTypeOf<{
    readonly foo: number | Encoded<number>;
  }>();

  expect(slot.name).toBe("foo");
  expect(slot.isRequired).toBe(true);
  expect(slot).not.toHaveProperty("defaultValue");
  expect(slot.parse("0")).toBe("0"); // 検証しない。
});

test("バリデーターで型を変更する", () => {
  const slot = surql.slot("foo").type((v): number => {
    if (typeof v === "number") {
      return v;
    }

    throw new TypeError("number");
  });
  type TSlot = typeof slot;

  expectTypeOf<TSlot["name"]>().toEqualTypeOf<"foo">();
  expectTypeOf<TSlot["isRequired"]>().toEqualTypeOf<true>();
  expectTypeOf<TSlot["defaultValue"]>()
    .toEqualTypeOf<number | Encoded<number> | undefined>();
  expectTypeOf<InferSlotVars<TSlot>>().toEqualTypeOf<{
    readonly foo: number | Encoded<number>;
  }>();

  expect(slot.name).toBe("foo");
  expect(slot.isRequired).toBe(true);
  expect(slot).not.toHaveProperty("defaultValue");
  expect(slot.parse(0)).toBe(0);
  expect(() => slot.parse("0")).toThrowErrorMatchingSnapshot(); // 検証する。
});

test("変数名を変える", () => {
  const slot1 = surql.slot("foo").type<number>();

  expectTypeOf<(typeof slot1)["name"]>().toEqualTypeOf<"foo">();
  expect(slot1.name).toBe("foo");

  const slot2 = slot1.rename("bar");

  expectTypeOf<(typeof slot2)["name"]>().toEqualTypeOf<"bar">();
  expect(slot2.name).toBe("bar");
});

test("変数名変更後は必須フラグとデフォルト値が引き継がれる", () => {
  const slot1 = surql.slot("foo").type<number>().default(42);

  expectTypeOf<(typeof slot1)["name"]>().toEqualTypeOf<"foo">();
  expectTypeOf<(typeof slot1)["isRequired"]>().toEqualTypeOf<false>();
  expectTypeOf<(typeof slot1)["defaultValue"]>()
    .toEqualTypeOf<number | Encoded<number> | undefined>();
  expect(slot1.name).toBe("foo");
  expect(slot1.isRequired).toBe(false);
  expect(slot1).toHaveProperty("defaultValue");
  expect(slot1.defaultValue).toBe(42);

  const slot2 = slot1.rename("bar");

  expectTypeOf<(typeof slot2)["name"]>().toEqualTypeOf<"bar">();
  expectTypeOf<(typeof slot2)["isRequired"]>().toEqualTypeOf<false>();
  expectTypeOf<(typeof slot2)["defaultValue"]>()
    .toEqualTypeOf<number | Encoded<number> | undefined>();
  expect(slot2.name).toBe("bar");
  expect(slot2.isRequired).toBe(false);
  expect(slot2).toHaveProperty("defaultValue");
  expect(slot2.defaultValue).toBe(42);
});

test("必須に変更", () => {
  const slot = surql.slot("foo").default(42).required();
  type TSlot = typeof slot;

  expectTypeOf<TSlot["name"]>().toEqualTypeOf<"foo">();
  expectTypeOf<TSlot["isRequired"]>().toEqualTypeOf<true>();
  expectTypeOf<TSlot["defaultValue"]>().toEqualTypeOf<unknown>();
  expectTypeOf<InferSlotVars<TSlot>>().toEqualTypeOf<{
    readonly foo: unknown;
  }>();

  expect(slot.name).toBe("foo");
  expect(slot.isRequired).toBe(true);
  expect(slot).not.toHaveProperty("defaultValue");
});
