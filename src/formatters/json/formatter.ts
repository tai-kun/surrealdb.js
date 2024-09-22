import {
  JsonUnsafeMapKeyError,
  SurrealTypeError,
} from "@tai-kun/surrealdb/errors";
import {
  cloneSync,
  type Data,
  EncodedJSON,
  type Formatter,
} from "@tai-kun/surrealdb/formatter";
import { isArrayBuffer, utf8 } from "@tai-kun/surrealdb/utils";

// https://github.com/fastify/secure-json-parse
const __PROTO__REGEX =
  /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
const CONSTRUCTOR_REGEX =
  /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;

// TODO(tai-kun): isSafeMapKey, isSafeObjectKey をオプションに追加
export default class JsonFormatter implements Formatter {
  contentType = "application/json";
  wsProtocols = ["json"];

  encodeSync(data: unknown): string {
    return JSON.stringify(data);
  }

  decodeSync(data: Data): unknown {
    const json = toString(data);

    if (__PROTO__REGEX.test(json)) {
      throw new JsonUnsafeMapKeyError("__proto__");
    }

    if (CONSTRUCTOR_REGEX.test(json)) {
      throw new JsonUnsafeMapKeyError("constructor");
    }

    return JSON.parse(json);
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

  toEncoded<TData>(data: TData): EncodedJSON<TData> {
    if (data instanceof EncodedJSON) {
      return data;
    }

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
      && Array.isArray(data)
      && data.every(b => Buffer.isBuffer(b)):
      return utf8.decode(Buffer.concat(data));

    default:
      throw new SurrealTypeError(
        ["String", "Buffer", "ArrayBuffer", "Uint8Array", "Buffer[]"],
        data,
      );
  }
}
