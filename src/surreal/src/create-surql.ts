import type { ToCBOR, Writer } from "@tai-kun/surrealdb/cbor";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { cloneSync, type Formatter } from "@tai-kun/surrealdb/formatter";

const MIME_CBOR_REGEX = /\bcbor\b/;
const MIME_JSON_REGEX = /\bjson\b/;

export interface CreateSurqlConfig {
  readonly formatter: Formatter;
  readonly varPrefix?: string | undefined;
}

export interface Surql {
  <T extends readonly unknown[] = unknown[]>(
    texts: readonly string[] | TemplateStringsArray,
    ...values: unknown[]
  ): {
    text: string;
    vars: { [p: string]: unknown };
    __type: T;
  };
}

export default function createSurql(config: CreateSurqlConfig): Surql {
  const {
    formatter,
    varPrefix = "_jst_", // JavaScript, Tagged Template Literals
  } = config;
  const transform: (value: unknown) => unknown = !formatter.mimeType
    ? v => v
    : MIME_JSON_REGEX.test(formatter.mimeType)
    ? v => cloneSync(formatter, v)
    : !MIME_CBOR_REGEX.test(formatter.mimeType)
    ? v => v
    : (data): ToCBOR & { bytes: Uint8Array } => ({
      bytes: formatter.encodeSync(data) as Uint8Array, // TODO(tai-kun): assert
      toCBOR(w: Writer) {
        w.writeBytes(this.bytes);
      },
    });

  return function surql(texts, ...values): any {
    if (texts.length - values.length === 1) {
      throw new SurrealTypeError(
        "template string",
        `texts.length=${texts.length} and values.length=${values.length}`,
      );
    }

    let text = "";
    const vars: { [p: string]: unknown } = {};

    for (let i = 0, j: number, len = texts.length; i < len; i++) {
      text += texts[i];

      if (i + 1 === len) {
        break;
      }

      j = values.indexOf(values[i]);

      if (j === -1) {
        j = i;
      }

      text += "$" + varPrefix + j;
      vars[varPrefix + j] = transform(values[j]);
    }

    return {
      text,
      vars,
    };
  };
}
