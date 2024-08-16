// @ts-nocheck

import { format } from "node:util";

global.Error = class Error extends global.Error {
  constructor(...args) {
    super(...args);
    let formatted = null;
    let formatting = false;
    let originalName = this.name;
    let originalMessage = this.message;
    Object.defineProperty(this, "name", {
      set: name => {
        originalName = name;
      },
      get: () => {
        if (formatting) {
          return originalName;
        }

        if (typeof formatted === "string") {
          return formatted;
        }

        formatting = true;
        const text = format(this);
        formatting = false;

        return formatted = text;
      },
    });
    Object.defineProperty(this, "message", {
      set: message => {
        originalMessage = message;
      },
      get: () => {
        if ("nameStr" in this) {
          return " ";
        }

        return originalMessage;
      },
    });
  }
};
