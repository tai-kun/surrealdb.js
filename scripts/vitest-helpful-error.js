// @ts-nocheck

import { formatWithOptions } from "node-inspect-extracted";

const OriginalError = global.Error;

global.Error.prototype.constructor = function(...args) {
  const this_ = OriginalError.prototype.constructor(...args); // super(...args);

  let formatted = null;
  let formatting = false;
  let originalName = this_.name;
  let originalMessage = this_.message;

  Object.defineProperty(this_, "name", {
    set(name) {
      originalName = name;
    },
    get() {
      if (formatting) {
        return originalName;
      }

      if (typeof formatted === "string") {
        return formatted;
      }

      formatting = true;
      const text = formatWithOptions({ depth: null }, this_);
      formatting = false;

      return formatted = text;
    },
  });

  return this_;
};
