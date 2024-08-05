import { CONTINUE, encode } from "@tai-kun/surrealdb/cbor";
import {
  CborMaxDepthReachedError,
  CborUnsafeMapKeyError,
  CircularReferenceError,
} from "@tai-kun/surrealdb/errors";
import { describe, expect, test } from "vitest";

describe("循環参照", () => {
  test("オブジェクト", () => {
    const a = {};
    Object.assign(a, { b: { a } });

    expect(() => encode(a)).toThrow(CircularReferenceError);
  });

  test("配列", () => {
    const a: any[] = [];
    a.push([[a]]);

    expect(() => encode(a)).toThrow(CircularReferenceError);
  });

  test("Map のキー", () => {
    const a = new Map();
    a.set(new Set([a]), 0);

    expect(() => encode(a)).toThrow(CircularReferenceError);
  });

  test("Map の値", () => {
    const a = new Map();
    a.set(0, new Set([a]));

    expect(() => encode(a)).toThrow(CircularReferenceError);
  });

  test("Set", () => {
    const a = new Set();
    a.add(new Set([a]));

    expect(() => encode(a)).toThrow(CircularReferenceError);
  });

  test("ネストされていなければ大丈夫", () => {
    const a = {};
    const b = [[a, a], { a, b: a }];

    expect(() => encode(b)).not.toThrow(CircularReferenceError);
  });
});

describe("replacer", () => {
  test("関数", () => {
    class Value {}

    const encoded = encode(new Value(), {
      replacer(value) {
        if (value instanceof Value) {
          return true;
        }

        return false;
      },
    });

    expect(encoded).toStrictEqual(
      new Uint8Array([
        0b111_10101, // mt: 7, ai: 21
      ]),
    );
  });

  test("配列", () => {
    class Value {}

    const encoded = encode(new Value(), {
      replacer: [
        () => CONTINUE,
        value => {
          if (value instanceof Value) {
            return true;
          }

          return false;
        },
      ],
    });

    expect(encoded).toStrictEqual(
      new Uint8Array([
        0b111_10101, // mt: 7, ai: 21
      ]),
    );
  });

  test("配列 (void 返し)", () => {
    class Value {}

    const encoded = encode(new Value(), {
      replacer: [
        () => {},
        value => {
          if (value instanceof Value) {
            return true;
          }

          return false;
        },
      ],
    });

    expect(encoded).toStrictEqual(
      new Uint8Array([
        0b111_10111, // mt: 7, ai: 23
      ]),
    );
  });
});

describe("isSafeMapKey", () => {
  test("__proto__", () => {
    const run = () => {
      encode(
        new Map([
          ["__proto__", 0],
        ]),
      );
    };

    expect(run).toThrowError(CborUnsafeMapKeyError);
  });

  test("constructor", () => {
    const run = () => {
      encode(
        new Map([
          ["constructor", 0],
        ]),
      );
    };

    expect(run).toThrowError(CborUnsafeMapKeyError);
  });

  test("カスタマイズ", () => {
    const run = () => {
      encode(
        new Map([
          ["unsafe-key", 0],
        ]),
        {
          isSafeMapKey: key => key !== "unsafe-key",
        },
      );
    };

    expect(run).toThrowError(CborUnsafeMapKeyError);
  });

  test("カスタマイズはオブジェクトに影響しない", () => {
    const run = () => {
      encode(
        {
          "unsafe-key": 0,
        },
        {
          isSafeMapKey: key => key !== "unsafe-key",
        },
      );
    };

    expect(run).not.toThrowError(CborUnsafeMapKeyError);
  });
});

describe("isSafeObjectKey", () => {
  test("__proto__", {
    // `Object.entries` が __proto__ を列挙しない場合、このテストは確実に失敗する。
    skip: Object.entries({ __proto__: 0 })
      .findIndex(([key]) => key === "__proto__") === -1,
  }, () => {
    const run = () => {
      encode(
        {
          "__proto__": 0,
        },
      );
    };

    expect(run).toThrowError(CborUnsafeMapKeyError);
  });

  test("constructor", () => {
    const run = () => {
      encode(
        {
          "constructor": 0,
        },
      );
    };

    expect(run).toThrowError(CborUnsafeMapKeyError);
  });

  test("カスタマイズ", () => {
    const run = () => {
      encode(
        {
          "unsafe-key": 0,
        },
        {
          isSafeObjectKey: key => key !== "unsafe-key",
        },
      );
    };

    expect(run).toThrowError(CborUnsafeMapKeyError);
  });

  test("カスタマイズは Map に影響しない", () => {
    const run = () => {
      encode(
        new Map([
          ["unsafe-key", 0],
        ]),
        {
          isSafeObjectKey: key => key !== "unsafe-key",
        },
      );
    };

    expect(run).not.toThrowError(CborUnsafeMapKeyError);
  });
});

describe("maxDepth", () => {
  test("最大深さと同じ深さなら大丈夫", () => {
    const run = () => {
      encode(
        [[]],
        { maxDepth: 2 },
      );
    };
    expect(run).not.toThrowError(CborMaxDepthReachedError);
  });

  test("最大深さを超えるオブジェクトでエラー", () => {
    const run = () => {
      encode(
        [[[]]],
        { maxDepth: 2 },
      );
    };
    expect(run).toThrowError(CborMaxDepthReachedError);
  });

  test("オブジェクトが深さのカウント対象", () => {
    const run = () => {
      encode(
        {
          // depth: 1
          a: new Map([
            // depth: 2
            ["b", [
              // depth: 3
              new Set([
                // depth: 4
              ]),
            ]],
          ]),
        },
        { maxDepth: 3 },
      );
    };
    expect(run).toThrowError(CborMaxDepthReachedError);
  });
});
