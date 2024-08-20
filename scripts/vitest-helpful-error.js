// @ts-nocheck

import { formatWithOptions } from "node-inspect-extracted";
import { expect } from "vitest";

let currentError = null;
const ORIGINAL_MESSAGE = Symbol();

expect.addSnapshotSerializer({
  test(value) {
    return value instanceof globalThis.Error && value !== currentError;
  },
  serialize(error, ...args) {
    const [, , , , print] = args;
    const kv = {
      name: error.name,
      message: error[ORIGINAL_MESSAGE],
    };
    const omit = [
      // スナップショットが変わりすぎるので取り除く。
      "stack",

      // Firefox が追加するエラーの情報。このような情報を持たない Chromium に合わせて取り除く。
      "fileName",
      "lineNumber",
      "columnNumber",

      // WebKit が追加するエラーの情報。このような情報を持たない Chromium に合わせて取り除く。
      "sourceURL",
      "line",
      "column",
    ];

    for (const p of Object.getOwnPropertyNames(error)) {
      if (p in kv || omit.includes(p)) {
        continue;
      }

      kv[p] = error[p];
    }

    return print(kv, ...args.slice(0, -1));
  },
});

class Error extends globalThis.Error {
  constructor(...args) {
    super(...args);

    if (typeof this.constructor.captureStackTrace === "function") {
      this.constructor.captureStackTrace(this, this.constructor);
    }

    let formatted = null;
    let formatting = false;
    let originalMessage = this.message;
    Object.defineProperty(this, "message", {
      set: message => {
        originalMessage = message;
      },
      get: () => {
        if (formatting) {
          return originalMessage;
        }

        if (typeof formatted === "string") {
          return formatted;
        }

        formatting = true;
        formatted = formatWithOptions({ depth: null }, this)
          .replace(/^[^:]*: */, "");
        formatting = false;

        return formatted;
      },
    });
    Object.defineProperty(this, ORIGINAL_MESSAGE, {
      get() {
        return originalMessage;
      },
    });
  }
}

// Error を new なしで構築するライブラリ (big.js) 用に関数呼び出しを可能にする。
globalThis.Error = new Proxy(Error, {
  apply(Error, thisArg, argArray) {
    return new Error(...argArray);
  },
});
