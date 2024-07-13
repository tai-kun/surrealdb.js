import { isCustomClass } from "@tai-kun/surreal/_lib";
import assert from "@tools/assert";
import { describe, test } from "@tools/test";
import Decimal from "decimal.js";
import DecimalLight from "decimal.js-light";

const classes = [
  class Simple {},
  class HasToString {
    toString() {
      return "function";
    }
  },
  class HasToStringTag {
    [Symbol.toStringTag]() {
      return "function";
    }
  },
  class {},
  class {
    constructor() {}
  },
  Decimal,
  DecimalLight,
];

const nonClasses = [
  // 値プロパティ
  Infinity,
  NaN,
  undefined,
  globalThis,

  // 基本オブジェクト
  Object,
  Function,
  Boolean,
  Symbol,

  // エラーオブジェクト
  Error,

  // 数値と日付
  Number,
  BigInt,
  Date,

  // テキスト処理
  // "String",
  RegExp,

  // 索引付きコレクション
  Array,
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array,

  // キー付きコレクション
  Map,
  Set,
  WeakMap,
  WeakSet,

  // 構造化データ
  ArrayBuffer,
  SharedArrayBuffer,
  Atomics,
  DataView,
  JSON,

  // 制御抽象化オブジェクト
  Promise,
  // Generator,
  (function*() {})(),
  // GeneratorFunction,
  function*() {}.constructor,
  // AsyncFunction,
  async function() {}.constructor,
  // AsyncGenerator,
  (async function*() {})(),
  // AsyncGeneratorFunction,
  async function*() {}.constructor,

  // リフレクション
  Reflect,
  Proxy,

  // 国際化
  Intl,
  Intl.Collator,
  Intl.DateTimeFormat,
  Intl.ListFormat,
  Intl.NumberFormat,
  Intl.PluralRules,
  Intl.RelativeTimeFormat,
  Intl.Locale,

  // WebAssembly
  WebAssembly,
  WebAssembly.Module,
  WebAssembly.Instance,
  WebAssembly.Memory,
  WebAssembly.Table,
  WebAssembly.CompileError,
  WebAssembly.LinkError,
  WebAssembly.RuntimeError,

  // その他
  0,
  "1",
  true,
  false,
  null,
  {},
  [],
  function() {},
];

describe("クラスであると判定する", () => {
  for (const value of classes) {
    test(String(value), () => {
      assert(isCustomClass(value));
    });
  }
});

describe("クラスでないと判定する", () => {
  for (const value of nonClasses) {
    test(String(value), () => {
      assert(!isCustomClass(value));
    });
  }
});
