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
    currentError = new Proxy(error, {
      get(e, p, r) {
        if (p === "message") {
          return e[ORIGINAL_MESSAGE];
        }

        return Reflect.get(e, p, r);
      },
      ownKeys(e) {
        return Reflect.ownKeys(e).map(p => p !== "stack");
      },
    });
    const text = print(currentError, ...args.slice(0, -1));
    currentError = null;

    return text;
  },
});

class Error extends globalThis.Error {
  constructor(...args) {
    super(...args);
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
