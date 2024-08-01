import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import type { Data, Formatter } from "@tai-kun/surrealdb/formatter";
import { isArrayBuffer, isBrowser } from "@tai-kun/surrealdb/utils";

export default class JsonFormatter implements Formatter {
  mimeType = "application/json";

  encodeSync(data: unknown): string {
    return JSON.stringify(data);
  }

  decodeSync(data: Data): unknown {
    return JSON.parse(toString(data));
  }
}

const decoder = /* @__PURE__ */ new TextDecoder();

function toString(data: Data): string {
  switch (true) {
    case typeof data === "string":
      return data;

    case data instanceof Uint8Array || isArrayBuffer(data):
      return decoder.decode(data);

    case !isBrowser()
      && Array.isArray(data) && data.every(b => Buffer.isBuffer(b)):
      return decoder.decode(Buffer.concat(data));

    default:
      throw new SurrealTypeError(
        "string | Buffer | ArrayBuffer | Uint8Array | Buffer[]",
        String(data),
      );
  }
}
