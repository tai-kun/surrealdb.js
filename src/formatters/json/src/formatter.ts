import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import type { Data, Formatter } from "@tai-kun/surrealdb/formatter";
import { isArrayBuffer, isBrowser } from "@tai-kun/surrealdb/utils";

export default class JsonFormatter implements Formatter {
  mimeType = "application/json";

  encodeSync(data: unknown): string {
    return JSON.stringify(data);
  }

  decodeSync(data: Data): unknown {
    if (isArrayBuffer(data)) {
      data = arrayBufferToString(data);
    } else if (!isBrowser()) {
      if (data instanceof Buffer) {
        data = bufferToString(data);
      } else if (Array.isArray(data)) {
        data = buffersToString(data);
      }
    }

    if (typeof data !== "string") {
      throw new SurrealTypeError(
        "string | ArrayBuffer | Buffer | Buffer[]",
        typeof data,
      );
    }

    return JSON.parse(data);
  }
}

const decoder = /* @__PURE__ */ new TextDecoder();

function arrayBufferToString(buffer: ArrayBuffer): string {
  return decoder.decode(buffer);
}

function bufferToString(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

function buffersToString(buffers: Buffer[]): string {
  return bufferToString(Buffer.concat(buffers));
}
