import { decode, encode, Tagged } from "@tai-kun/surreal/cbor";
import { describe, expect, test } from "vitest";

// https://github.com/cbor/test-vectors より JavaScript 向けに編集
for (
  const c of [
    {
      hex: "00",
      value: 0,
      decode: true,
      encode: true,
    },
    {
      hex: "01",
      value: 1,
      decode: true,
      encode: true,
    },
    {
      hex: "0a",
      value: 10,
      decode: true,
      encode: true,
    },
    {
      hex: "17",
      value: 23,
      decode: true,
      encode: true,
    },
    {
      hex: "1818",
      value: 24,
      decode: true,
      encode: true,
    },
    {
      hex: "1819",
      value: 25,
      decode: true,
      encode: true,
    },
    {
      hex: "1864",
      value: 100,
      decode: true,
      encode: true,
    },
    {
      hex: "1903e8",
      value: 1000,
      decode: true,
      encode: true,
    },
    {
      hex: "1a000f4240",
      value: 1000000,
      decode: true,
      encode: true,
    },
    {
      hex: "1b000000e8d4a51000",
      value: 1000000000000,
      decode: true,
      encode: true,
    },
    {
      hex: "1bffffffffffffffff",
      value: 18446744073709551615n,
      decode: true,
      encode: true,
    },
    {
      hex: "c249010000000000000000",
      value: 18446744073709551616n,
      decode: false, // まだ Bignums が未実装
      encode: false, // まだ Bignums が未実装
    },
    {
      hex: "3bffffffffffffffff",
      value: -18446744073709551616n,
      decode: true,
      encode: true,
    },
    {
      hex: "c349010000000000000000",
      value: -18446744073709551617n,
      decode: false, // まだ Bignums が未実装
      encode: false, // まだ Bignums が未実装
    },
    {
      hex: "20",
      value: -1,
      decode: true,
      encode: true,
    },
    {
      hex: "29",
      value: -10,
      decode: true,
      encode: true,
    },
    {
      hex: "3863",
      value: -100,
      decode: true,
      encode: true,
    },
    {
      hex: "3903e7",
      value: -1000,
      decode: true,
      encode: true,
    },
    {
      hex: "f90000",
      value: 0.0,
      decode: true,
      encode: false, // 0.0 は 0 になるので、エンコード結果は hex と一致しない
    },
    {
      hex: "f98000",
      value: -0.0,
      decode: true,
      encode: false, // -0.0 は 0 になるので、エンコード結果は hex と一致しない
    },
    {
      hex: "f93c00",
      value: 1.0,
      decode: true,
      encode: false, // 1.0 は 1 になるので、エンコード結果は hex と一致しない
    },
    {
      hex: "fb3ff199999999999a",
      value: 1.1,
      decode: true,
      encode: true,
    },
    {
      hex: "f93e00",
      value: 1.5,
      decode: true,
      encode: false, // 小数は float64 でエンコードされるので hex と一致しない
    },
    {
      hex: "f97bff",
      value: 65504.0,
      decode: true,
      encode: false, // 65504.0 は 65504 になるので、エンコード結果は hex と一致しない
    },
    {
      hex: "fa47c35000",
      value: 100000.0,
      decode: true,
      encode: false, // 100000.0 は 100000 になるので、エンコード結果は hex と一致しない
    },
    {
      hex: "fa7f7fffff",
      value: 3.4028234663852886e+38,
      decode: true,
      encode: false, // 安全な整数の範囲を超えているので、エンコードできない
    },
    {
      hex: "fb7e37e43c8800759c",
      value: 1e+300,
      decode: true,
      encode: false, // 安全な整数の範囲を超えているので、エンコードできない
    },
    {
      hex: "f90001",
      value: 5.960464477539063e-8,
      decode: true,
      encode: false, // 小数は float64 でエンコードされるので hex と一致しない
    },
    {
      hex: "f90400",
      value: 0.00006103515625,
      decode: true,
      encode: false, // 小数は float64 でエンコードされるので hex と一致しない
    },
    {
      hex: "f9c400",
      value: -4.0,
      decode: true,
      encode: false, // -4.0 は 4.0 になるので、エンコード結果は hex と一致しない
    },
    {
      hex: "fbc010666666666666",
      value: -4.1,
      decode: true,
      encode: true,
    },
    {
      hex: "f97c00",
      value: Infinity,
      decode: true,
      encode: true,
    },
    {
      hex: "f97e00",
      value: NaN,
      decode: true,
      encode: true,
    },
    {
      hex: "f9fc00",
      value: -Infinity,
      decode: true,
      encode: true,
    },
    {
      hex: "fa7f800000",
      value: Infinity,
      decode: true,
      encode: false, // Infinity は f97c00 にエンコードされるので hex と一致しない
    },
    {
      hex: "fa7fc00000",
      value: NaN,
      decode: true,
      encode: false, // NaN は f97e00 にエンコードされるので hex と一致しない
    },
    {
      hex: "faff800000",
      value: -Infinity,
      decode: true,
      encode: false, // -Infinity は f9fc00 にエンコードされるので hex と一致しない
    },
    {
      hex: "fb7ff0000000000000",
      value: Infinity,
      decode: true,
      encode: false, // Infinity は f97c00 にエンコードされるので hex と一致しない
    },
    {
      hex: "fb7ff8000000000000",
      value: NaN,
      decode: true,
      encode: false, // NaN は f97e00 にエンコードされるので hex と一致しない
    },
    {
      hex: "fbfff0000000000000",
      value: -Infinity,
      decode: true,
      encode: false, // -Infinity は f9fc00 にエンコードされるので hex と一致しない
    },
    {
      hex: "f4",
      value: false,
      decode: true,
      encode: true,
    },
    {
      hex: "f5",
      value: true,
      decode: true,
      encode: true,
    },
    {
      hex: "f6",
      value: null,
      decode: true,
      encode: true,
    },
    {
      hex: "f7",
      value: undefined,
      decode: true,
      encode: true,
    },
    {
      hex: "40",
      value: new Uint8Array([]),
      decode: true,
      encode: true,
    },
    {
      hex: "4401020304",
      value: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
      decode: true,
      encode: true,
    },
    {
      hex: "60",
      value: "",
      decode: true,
      encode: true,
    },
    {
      hex: "6161",
      value: "a",
      decode: true,
      encode: true,
    },
    {
      hex: "6449455446",
      value: "IETF",
      decode: true,
      encode: true,
    },
    {
      hex: "62225c",
      value: "\"\\",
      decode: true,
      encode: true,
    },
    {
      hex: "62c3bc",
      value: "ü",
      decode: true,
      encode: true,
    },
    {
      hex: "63e6b0b4",
      value: "水",
      decode: true,
      encode: true,
    },
    {
      hex: "64f0908591",
      value: "𐅑",
      decode: true,
      encode: true,
    },
    {
      hex: "80",
      value: [],
      decode: true,
      encode: true,
    },
    {
      hex: "83010203",
      value: [
        1,
        2,
        3,
      ],
      decode: true,
      encode: true,
    },
    {
      hex: "8301820203820405",
      value: [
        1,
        [
          2,
          3,
        ],
        [
          4,
          5,
        ],
      ],
      decode: true,
      encode: true,
    },
    {
      hex: "98190102030405060708090a0b0c0d0e0f101112131415161718181819",
      value: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
      ],
      decode: true,
      encode: true,
    },
    {
      hex: "a0",
      value: {},
      decode: true,
      encode: true,
    },
    {
      hex: "a26161016162820203",
      value: {
        a: 1,
        b: [
          2,
          3,
        ],
      },
      decode: true,
      encode: true,
    },
    {
      hex: "826161a161626163",
      value: [
        "a",
        {
          b: "c",
        },
      ],
      decode: true,
      encode: true,
    },
    {
      hex: "a56161614161626142616361436164614461656145",
      value: {
        a: "A",
        b: "B",
        c: "C",
        d: "D",
        e: "E",
      },
      decode: true,
      encode: true,
    },
    {
      hex: "7f657374726561646d696e67ff", // 不定長
      value: "streaming",
      decode: true,
      encode: false, // 固定長文字列でエンコードするので hex と一致しない
    },
    {
      hex: "9fff", // 不定長
      value: [],
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
    {
      hex: "9f018202039f0405ffff", // 不定長
      value: [
        1,
        [
          2,
          3,
        ],
        [
          4,
          5,
        ],
      ],
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
    {
      hex: "9f01820203820405ff", // 不定長
      value: [
        1,
        [
          2,
          3,
        ],
        [
          4,
          5,
        ],
      ],
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
    {
      hex: "83018202039f0405ff", // 不定長を含む
      value: [
        1,
        [
          2,
          3,
        ],
        [
          4,
          5,
        ],
      ],
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
    {
      hex: "83019f0203ff820405", // 不定長を含む
      value: [
        1,
        [
          2,
          3,
        ],
        [
          4,
          5,
        ],
      ],
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
    {
      hex: "9f0102030405060708090a0b0c0d0e0f101112131415161718181819ff", // 不定長
      value: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
      ],
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
    {
      hex: "bf61610161629f0203ffff", // 不定長
      value: {
        a: 1,
        b: [
          2,
          3,
        ],
      },
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
    {
      hex: "826161bf61626163ff", // 不定長を含む
      value: [
        "a",
        {
          b: "c",
        },
      ],
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
    {
      hex: "bf6346756ef563416d7421ff", // 不定長を含む
      value: {
        Fun: true,
        Amt: -2,
      },
      decode: true,
      encode: false, // 固定長配列でエンコードするので hex と一致しない
    },
  ]
) {
  const {
    hex,
    value,
    decode: decodeOk,
    encode: encodeOk,
  } = c;
  const bytes = new Uint8Array(
    hex
      .match(/.{1,2}/g)!
      .map(byte => parseInt(byte, 16)),
  );
  const toHexArray = (bytes: Uint8Array) =>
    [...bytes].map(byte => byte.toString(16).padStart(2, "0"));

  test(`decode(${hex})`, { fails: !decodeOk }, () => {
    expect(decode(bytes)).toStrictEqual(value);
  });

  test(`encode(${hex})`, { fails: !encodeOk }, () => {
    expect(toHexArray(encode(value))).toStrictEqual(toHexArray(bytes));
  });
}

describe("Tagged(10, 20)", () => {
  const value = new Tagged(10, 20);
  const bytes = new Uint8Array([
    0b110_01010, // mt: 6, ai: 10
    0b000_10100, // mt: 0, ai: 20
  ]);

  test("decode", () => {
    expect(decode(bytes)).toStrictEqual(value);
  });

  test("reviver", () => {
    expect(
      decode(bytes, {
        reviver: {
          tagged(t) {
            switch (t.tag) {
              case 10:
                return t.value;

              default:
                return undefined;
            }
          },
        },
      }),
    )
      .toStrictEqual(20);
  });

  test("encode", () => {
    expect(encode(value)).toStrictEqual(bytes);
  });
});
