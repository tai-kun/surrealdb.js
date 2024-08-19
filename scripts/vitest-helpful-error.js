// @ts-nocheck

import { formatWithOptions } from "node-inspect-extracted";

Error = new Proxy(Error, {
  construct: function construct(Err, args) {
    const err = new Err(...args);

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(err, construct);
    }

    err.message = formatWithOptions({ depth: null }, err)
      .replace(new RegExp(`^${err.name}: *`), "");

    return err;
  },
});
