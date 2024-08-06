import { Slot, surql } from "@tai-kun/surrealdb";
import type { Writer } from "@tai-kun/surrealdb/cbor";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { EncodedCBOR } from "@tai-kun/surrealdb/formatter";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(".text はエンコード済み", () => {
  const CreateUserQuery = surql`CREATE user:foo;`;

  const writeBytes = vi.fn();
  const writer = { writeBytes } as unknown as Writer;

  afterEach(() => {
    writeBytes.mockClear();
  });

  test(".text", () => {
    expect(CreateUserQuery.text).toBeInstanceOf(EncodedCBOR);
    (CreateUserQuery.text as EncodedCBOR).toCBOR(writer);
    expect(writeBytes.mock.calls).toStrictEqual([
      [
        // `CREATE user:foo;`
        new Uint8Array([
          0x70, // mt: 3, ai: 16
          0x43, // `C`
          0x52, // `R`
          0x45, // `E`
          0x41, // `A`
          0x54, // `T`
          0x45, // `E`
          0x20, // ` `
          0x75, // `u`
          0x73, // `s`
          0x65, // `e`
          0x72, // `r`
          0x3a, // `:`
          0x66, // `f`
          0x6f, // `o`
          0x6f, // `o`
          0x3b, // `;`
        ]),
      ],
    ]);
  });
});

describe("変数を埋め込める", () => {
  const variable = 10;
  const CreateUserQuery = surql`RETURN ${variable};`;

  const writeBytes = vi.fn();
  const writer = { writeBytes } as unknown as Writer;

  afterEach(() => {
    writeBytes.mockClear();
  });

  test(".text", () => {
    expect(CreateUserQuery.text).toBeInstanceOf(EncodedCBOR);
    (CreateUserQuery.text as EncodedCBOR).toCBOR(writer);
    expect(writeBytes.mock.calls).toStrictEqual([
      [
        // `RETURN $_jst_0;`
        new Uint8Array([
          0x6f, // mt: 3, ai: 15
          0x52, // `R`
          0x45, // `E`
          0x54, // `T`
          0x55, // `U`
          0x52, // `R`
          0x4e, // `N`
          0x20, // ` `
          0x24, // `$`
          0x5f, // `_`
          0x6a, // `j`
          0x73, // `s`
          0x74, // `t`
          0x5f, // `_`
          0x30, // `0`
          0x3b, // `;`
        ]),
      ],
    ]);
  });

  test(".vars", () => {
    expect(CreateUserQuery.vars).toHaveProperty("_jst_0");

    expect(CreateUserQuery.vars["_jst_0"]).toBeInstanceOf(EncodedCBOR);
    (CreateUserQuery.vars["_jst_0"] as EncodedCBOR).toCBOR(writer);
    expect(writeBytes.mock.calls).toStrictEqual([
      [
        // `10`
        new Uint8Array([
          0x0a, // mt: 0, ai: 10
        ]),
      ],
    ]);
  });
});

describe("スロットを埋め込める", () => {
  const ValueSlot = surql.slot("value");
  const CreateUserQuery = surql`RETURN ${ValueSlot};`;

  const writeBytes = vi.fn();
  const writer = { writeBytes } as unknown as Writer;

  afterEach(() => {
    writeBytes.mockClear();
  });

  test(".text", () => {
    expect(CreateUserQuery.text).toBeInstanceOf(EncodedCBOR);
    (CreateUserQuery.text as EncodedCBOR).toCBOR(writer);
    expect(writeBytes.mock.calls).toStrictEqual([
      [
        // `RETURN $value;`
        new Uint8Array([
          0x6e, // mt: 3, ai: 14
          0x52, // `R`
          0x45, // `E`
          0x54, // `T`
          0x55, // `U`
          0x52, // `R`
          0x4e, // `N`
          0x20, // ` `
          0x24, // `$`
          0x76, // `v`
          0x61, // `a`
          0x6c, // `l`
          0x75, // `u`
          0x65, // `e`
          0x3b, // `;`
        ]),
      ],
    ]);
  });

  test(".vars", () => {
    expect(CreateUserQuery.vars).not.toHaveProperty("value");
  });

  test(".slots", () => {
    expect(CreateUserQuery.slots).toMatchObject([
      new Slot("value", true),
    ]);
  });
});

describe("同じオブジェクトを 2 度以上処理しない", () => {
  const variable = [10];
  // const ValueSlot = surql.slot("value");
  const CreateUserQuery = surql`RETURN [${variable}, ${variable}];`;

  const writeBytes = vi.fn();
  const writer = { writeBytes } as unknown as Writer;

  afterEach(() => {
    writeBytes.mockClear();
  });

  test(".text", () => {
    expect(CreateUserQuery.text).toBeInstanceOf(EncodedCBOR);
    (CreateUserQuery.text as EncodedCBOR).toCBOR(writer);
    expect(writeBytes.mock.calls).toStrictEqual([
      [
        // `RETURN [$_jst_0, $_jst_0];`
        new Uint8Array([
          0x78, // mt: 3, ai: 24
          0x1a, // 26
          0x52, // `R`
          0x45, // `E`
          0x54, // `T`
          0x55, // `U`
          0x52, // `R`
          0x4e, // `N`
          0x20, // ` `
          0x5b, // `[`
          0x24, // `$`
          0x5f, // `_`
          0x6a, // `j`
          0x73, // `s`
          0x74, // `t`
          0x5f, // `_`
          0x30, // `0`
          0x2c, // `,`
          0x20, // ` `
          0x24, // `$`
          0x5f, // `_`
          0x6a, // `j`
          0x73, // `s`
          0x74, // `t`
          0x5f, // `_`
          0x30, // `0`
          0x5d, // `]`
          0x3b, // `;`
        ]),
      ],
    ]);
  });

  test(".vars", () => {
    expect(CreateUserQuery.vars).toHaveProperty("_jst_0");
    expect(CreateUserQuery.vars).not.toHaveProperty("_jst_1");

    expect(CreateUserQuery.vars["_jst_0"]).toBeInstanceOf(EncodedCBOR);
    (CreateUserQuery.vars["_jst_0"] as EncodedCBOR).toCBOR(writer);
    expect(writeBytes.mock.calls).toStrictEqual([
      [
        // `[10]`
        new Uint8Array([
          0x81, // mt: 4, ai: 1
          0x0a, // 10
        ]),
      ],
    ]);
  });
});

describe("エラー", () => {
  test("特定の変数名から始まるスロットでエラー", () => {
    const ValueSlot = surql.slot("_jst_foo");

    expect(() => surql`RETURN ${ValueSlot};`).toThrow(SurrealTypeError);
  });
});
