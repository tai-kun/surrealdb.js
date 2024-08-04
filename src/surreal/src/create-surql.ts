import type { ToCBOR, Writer } from "@tai-kun/surrealdb/cbor";
import { Slot } from "@tai-kun/surrealdb/clients/standard";
import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import { cloneSync, type Formatter } from "@tai-kun/surrealdb/formatter";

const MIME_CBOR_REGEX = /\bcbor\b/;
const MIME_JSON_REGEX = /\bjson\b/;

export interface Surql {
  <V extends unknown[] = unknown[]>(
    texts: readonly string[] | TemplateStringsArray,
    ...values: V
  ): {
    text: string;
    vars: { [p: string]: unknown };
    slots: Extract<V[number], Slot>[];
    // TODO(tai-kun): 検証機能をつける？
    returns: {
      <T extends readonly unknown[] = unknown[]>(): {
        text: string;
        vars: { [p: string]: unknown };
        slots: Extract<V[number], Slot>[];
        /** @deprecated */
        __type: T;
      };
    };
  };
  slot: {
    <N extends string, T>(name: N): Slot<N, true, T | undefined>;
    <N extends string, T>(name: N, defaultValue: T): Slot<N, false, T>;
  };
}

export interface CreateSurqlConfig {
  readonly formatter: Formatter;
  readonly varPrefix?: string | undefined;
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

  function surql(texts: readonly string[], ...values: unknown[]): {
    text: string;
    vars: { [p: string]: unknown };
    slots: Slot[];
    returns(): {
      text: string;
      vars: { [p: string]: unknown };
      slots: Slot[];
    };
  } {
    if (texts.length - values.length !== 1) {
      throw new SurrealTypeError(
        "template string",
        `texts.length=${texts.length} and values.length=${values.length}`,
      );
    }

    let text = "";
    const vars: { [p: string]: unknown } = {};
    const slots: Slot[] = [];

    for (let i = 0, j: number, v, len = texts.length; i < len; i++) {
      text += texts[i];

      if (i + 1 === len) {
        break;
      }

      for (j = 0; j < i; j++) {
        if (Object.is(values[j], values[i])) {
          break;
        }
      }

      v = values[j];

      if (v instanceof Slot) {
        text += "$" + v.name;
        slots.push(v);
      } else {
        text += "$" + varPrefix + j;
        vars[varPrefix + j] = transform(v);
      }
    }

    return {
      text,
      vars,
      slots,
      returns() {
        return {
          text: this.text,
          vars: this.vars,
          slots: this.slots,
        };
      },
    };
  }

  function slot(...args: [name: string, defaultValue?: unknown]): Slot {
    return args.length >= 2
      ? new Slot(args[0], false, args[1])
      : new Slot(args[0], true);
  }

  // @ts-expect-error
  return Object.assign(surql, { slot });
}
