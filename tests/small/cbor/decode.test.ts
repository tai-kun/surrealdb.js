import { decode } from "@tai-kun/surrealdb/cbor";
import {
  CborMaxDepthReachedError,
  CborSyntaxError,
  CborTooLittleDataError,
  CborUnsafeMapKeyError,
} from "@tai-kun/surrealdb/errors";
import { describe, expect, test } from "vitest";

describe("map", () => {
  test("プレーンオブジェクトの代わりに Map オブジェクト", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0x81, // mt: 4, ai: 1
      0x00, // mt: 0, ai: 0
      // value
      0x00, // mt: 0, ai: 0
    ]);

    expect(decode(bytes, { mapType: "Map" })).toStrictEqual(
      new Map([
        [[0], 0],
      ]),
    );
  });
});

describe("isSafeMapKey", () => {
  test("__proto__", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0b011_01001, // mt: 3, ai: 9
      0x5f, // _
      0x5f, // _
      0x70, // p
      0x72, // r
      0x6f, // o
      0x74, // t
      0x6f, // o
      0x5f, // _
      0x5f, // _
      // value
      0x00, // mt: 0, ai: 0
    ]);

    const run = () => {
      decode(bytes, { mapType: "Map" });
    };
    expect(run).toThrow(CborUnsafeMapKeyError);
  });

  test("constructor", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0b011_01011, // mt: 3, ai: 11
      0x63, // c
      0x6f, // o
      0x6e, // n
      0x73, // s
      0x74, // t
      0x72, // r
      0x75, // u
      0x63, // c
      0x74, // t
      0x6f, // o
      0x72, // r
      // value
      0x00, // mt: 0, ai: 0
    ]);

    const run = () => {
      decode(bytes, { mapType: "Map" });
    };
    expect(run).toThrow(CborUnsafeMapKeyError);
  });

  test("カスタマイズ", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0b011_00001, // mt: 3, ai: 1
      0x00, // mt: 0, ai: 1
      // value
      0x02, // mt: 0, ai: 2
    ]);

    const run = () => {
      decode(bytes, {
        mapType: "Map",
        isSafeMapKey: k => k === 1,
      });
    };
    expect(run).toThrow(CborUnsafeMapKeyError);
  });

  test("カスタマイズはオブジェクトに影響しない", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0b011_00001, // mt: 3, ai: 1
      0x00, // mt: 0, ai: 1
      // value
      0x02, // mt: 0, ai: 2
    ]);

    const run = () => {
      decode(bytes, {
        // mapType: "Map",
        isSafeMapKey: k => k === 1,
      });
    };
    expect(run).not.toThrow(CborUnsafeMapKeyError);
  });
});

describe("isSafeObjectKey", () => {
  test("__proto__", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0b011_01001, // mt: 3, ai: 9
      0x5f, // _
      0x5f, // _
      0x70, // p
      0x72, // r
      0x6f, // o
      0x74, // t
      0x6f, // o
      0x5f, // _
      0x5f, // _
      // value
      0x00, // mt: 0, ai: 0
    ]);

    const run = () => {
      decode(bytes);
    };
    expect(run).toThrow(CborUnsafeMapKeyError);
  });

  test("constructor", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0b011_01011, // mt: 3, ai: 11
      0x63, // c
      0x6f, // o
      0x6e, // n
      0x73, // s
      0x74, // t
      0x72, // r
      0x75, // u
      0x63, // c
      0x74, // t
      0x6f, // o
      0x72, // r
      // value
      0x00, // mt: 0, ai: 0
    ]);

    const run = () => {
      decode(bytes);
    };
    expect(run).toThrow(CborUnsafeMapKeyError);
  });

  test("カスタマイズ", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0b011_00001, // mt: 3, ai: 1
      0x00, // mt: 0, ai: 1
      // value
      0x02, // mt: 0, ai: 2
    ]);

    const run = () => {
      decode(bytes, {
        isSafeObjectKey: k => k === 1,
      });
    };
    expect(run).toThrow(CborUnsafeMapKeyError);
  });

  test("カスタマイズは Map に影響しない", () => {
    const bytes = new Uint8Array([
      0xa1, // mt: 5, ai: 1
      // key
      0b011_00001, // mt: 3, ai: 1
      0x00, // mt: 0, ai: 1
      // value
      0x02, // mt: 0, ai: 2
    ]);

    const run = () => {
      decode(bytes, {
        mapType: "Map",
        isSafeObjectKey: k => k === 1,
      });
    };
    expect(run).not.toThrow(CborUnsafeMapKeyError);
  });
});

describe("maxDepth", () => {
  test("最大深さと同じ深さなら大丈夫", () => {
    // [[]]
    const bytes = new Uint8Array([
      0x81, // mt: 4, ai: 1
      0x80, // mt: 4, ai: 0
    ]);

    const run = () => {
      decode(
        bytes,
        { maxDepth: 2 },
      );
    };
    expect(run).not.toThrow(CborMaxDepthReachedError);
  });

  test("最大深さを超えるオブジェクトでエラー", () => {
    // [[[]]]
    const bytes = new Uint8Array([
      0x81, // mt: 4, ai: 1
      0x81, // mt: 4, ai: 1
      0x80, // mt: 4, ai: 0
    ]);

    const run = () => {
      const a = decode(
        bytes,
        { maxDepth: 2 },
      );
      console.dir(a, { depth: null });
    };
    expect(run).toThrow(CborMaxDepthReachedError);
  });
});

describe("Well-Formedness Errors", () => {
  // 現在未使用
  // describe("Too much data", () => {});

  describe("Too little data", () => {
    test("文字数が足りない", () => {
      const bytes = new Uint8Array([
        0b011_00011, // mt: 3, ai: 3 <- 3 bytes
        0b010_01000, // H <- 1/3
        0b011_00101, // e <- 2/3
        // 0b011_11001, // y <- 3/3 (LOST)
      ]);

      expect(() => decode(bytes)).toThrow(CborTooLittleDataError);
    });
  });

  describe("Syntax error", () => {
    for (const mt of [0, 1, 2, 3, 4, 5, 6, 7]) {
      for (const ai of [28, 29, 30]) {
        // dprint-ignore
        const bin =
            mt.toString(2).padStart(3, "0")
          + ai.toString(2).padStart(5, "0");

        test(`0b${bin} (mt=${mt},ai=${ai}) は予約済み`, () => {
          const bytes = new Uint8Array([
            Number.parseInt(bin, 2),
          ]);

          expect(() => decode(bytes)).toThrow(
            new CborSyntaxError(
              `The additional info ${ai} is reserved for future additions to `
                + "the CBOR format.",
            ),
          );
        });
      }
    }

    test("正の整数は不定長バイトをとれない", () => {
      const bytes = new Uint8Array([
        0b000_11111,
      ]);

      expect(() => decode(bytes)).toThrow(
        new CborSyntaxError(
          "The data item `unsigned integer` has indefinite-length bytes.",
        ),
      );
    });

    test("負の整数は不定長バイトをとれない", () => {
      const bytes = new Uint8Array([
        0b001_11111,
      ]);

      expect(() => decode(bytes)).toThrow(
        new CborSyntaxError(
          "The data item `negative integer` has indefinite-length bytes.",
        ),
      );
    });

    test("タグは不定長バイトをとれない", () => {
      const bytes = new Uint8Array([
        0b110_11111,
      ]);

      expect(() => decode(bytes)).toThrow(
        new CborSyntaxError(
          "The data item `tagged item` has indefinite-length bytes.",
        ),
      );
    });

    test("不定長バイトの開始なく BREAK できない", () => {
      const bytes = new Uint8Array([
        0xff,
      ]);

      expect(() => decode(bytes)).toThrow(
        new CborSyntaxError(
          `The "break" stop code was encountered outside of a indefinite-length`
            + " data item.",
        ),
      );
    });

    test("不定長のバイト文字列は全データアイテムのメジャータイプが 4", () => {
      const bytes = new Uint8Array([
        0b010_11111, // mt: 2, ai: 31
        0b010_00011, // mt: 3, ai: 3
        0b010_00000,
        0b010_00000,
        0b010_00000,
        0b000_00000, // mt: 0, ai: 0 <- ERROR
        0b111_11111, // BREAK
      ]);

      expect(() => decode(bytes)).toThrow(
        new CborSyntaxError(
          "The payload of the data item `byte string` contains a mismatched "
            + "data item `unsigned integer`.",
        ),
      );
    });

    test("不定長の UTF-8 文字列は全データアイテムのメジャータイプが 3", () => {
      const bytes = new Uint8Array([
        0b011_11111, // mt: 3, ai: 31
        0b011_00011, // mt: 3, ai: 3
        0b010_01000, // H <- OK (ASCII)
        0b011_00101, // e <- OK (ASCII)
        0b011_11001, // y <- OK (ASCII)
        0b000_00000, // mt: 0, ai: 0 <- ERROR
        0b111_11111, // BREAK
      ]);

      expect(() => decode(bytes)).toThrow(
        new CborSyntaxError(
          "The payload of the data item `utf8 string` contains a mismatched "
            + "data item `unsigned integer`.",
        ),
      );
    });

    test("不定長のバイト文字列に不定長のバイト文字列だめ", () => {
      const bytes = new Uint8Array([
        0b010_11111, // mt: 2, ai: 31
        0b010_00011, // mt: 3, ai: 3
        0b010_00000,
        0b010_00000,
        0b010_00000,
        ...[
          0b010_11111, // mt: 2, ai: 31 <- ERROR
          0b010_00011, // mt: 3, ai: 3
          0b010_00000,
          0b010_00000,
          0b010_00000,
          0b111_11111, // BREAK
        ],
        0b111_11111, // BREAK
      ]);

      expect(() => decode(bytes)).toThrow(
        new CborSyntaxError(
          "The payload of the indefinite-length data item `byte string` "
            + "contains the same type.",
        ),
      );
    });

    test("不定長 UTF-8 文字列に不定長 UTF-8 文字列だめ", () => {
      const bytes = new Uint8Array([
        0b011_11111, // mt: 3, ai: 31
        0b011_00011, // mt: 3, ai: 3
        0b010_01000, // H <- OK (ASCII)
        0b011_00101, // e <- OK (ASCII)
        0b011_11001, // y <- OK (ASCII)
        ...[
          0b011_11111, // mt: 3, ai: 31 <- ERROR
          0b011_00011, // mt: 3, ai: 3
          0b010_01000, // H
          0b011_00101, // e
          0b011_11001, // y
          0b111_11111, // BREAK
        ],
        0b111_11111, // BREAK
      ]);

      expect(() => decode(bytes)).toThrow(
        new CborSyntaxError(
          "The payload of the indefinite-length data item `utf8 string` "
            + "contains the same type.",
        ),
      );
    });
  });
});
