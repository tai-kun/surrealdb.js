import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import {
  cloneSync,
  type Data,
  EncodedJSON,
  type Formatter,
} from "@tai-kun/surrealdb/formatter";
import { isArrayBuffer, utf8 } from "@tai-kun/surrealdb/utils";

export default class JsonFormatter implements Formatter {
  mimeType = "application/json";

  encodeSync(data: unknown): string {
    return JSON.stringify(data);
  }

  decodeSync(data: Data): unknown {
    return JSON.parse(toString(data));
  }

  cloneSync<T>(data: T): T {
    switch (typeof data) {
      case "string":
      case "number":
      case "boolean":
        return data;

      default:
        switch (data) {
          case null:
          case undefined:
            return data;

          default:
            return cloneSync(this, data);
        }
    }
  }

  toEncoded(data: unknown): EncodedJSON {
    return new EncodedJSON(
      {
        data: this.cloneSync(data),
      },
      function toJSON() {
        return this.data;
      },
      // TODO(tai-kun): JSON フォーマッターの事前エンコーディングを実装する。
      // function toRawJSON() {
      //   return (this.json ??= JSON.stringify(this.data));
      // },
    );
  }
}

function toString(data: Data): string {
  switch (true) {
    case typeof data === "string":
      return data;

    case data instanceof Uint8Array || isArrayBuffer(data):
      return utf8.decode(data);

    case typeof Buffer !== "undefined"
      && Array.isArray(data) && data.every(b => Buffer.isBuffer(b)):
      return utf8.decode(Buffer.concat(data));

    default:
      throw new SurrealTypeError(
        "string | Buffer | ArrayBuffer | Uint8Array | Buffer[]",
        String(data),
      );
  }
}
