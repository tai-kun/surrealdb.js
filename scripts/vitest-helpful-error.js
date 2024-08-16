// @ts-nocheck

import { formatWithOptions } from "node-inspect-extracted";

const super_ = globalThis.Error.prototype.constructor;

globalThis.Error.prototype.constructor = function(...args) {
  const this_ = super_(...args);

  let formatted = null;
  let formatting = false;
  let originalName = this_.name;

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
      formatted = formatWithOptions({ depth: null }, this_);
      formatting = false;

      return formatted;
    },
  });

  return this_;
};
