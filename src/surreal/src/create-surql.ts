import { SurrealTypeError } from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import PreparedQuery from "./prepared-query";
import Slot from "./slot";

export interface Surql {
  <V extends unknown[] = unknown[]>(
    texts: readonly string[] | TemplateStringsArray,
    ...values: V
  ): PreparedQuery<Extract<V[number], Slot>>;
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

  function surql(texts: readonly string[], ...values: unknown[]) {
    if (texts.length - values.length !== 1) {
      throw new SurrealTypeError(
        "template string",
        `texts.length=${texts.length} and values.length=${values.length}`,
      );
    }

    let text = "";
    const vars: { [p: string]: unknown } = {};
    const slots: Slot[] = [];

    for (
      let i = 0,
        j: number,
        v,
        len = texts.length,
        named: string[] = [];
      i < len;
      i++
    ) {
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

        if (j === i && named.indexOf(v.name) < 0) {
          if ((v.name as string).startsWith(varPrefix)) {
            throw new SurrealTypeError(
              `a variable name that do not start with "${varPrefix}"`,
              v.name,
            );
          }

          slots.push(v);
          named.push(v.name);
        }
      } else {
        text += "$" + varPrefix + j;

        if (j === i) {
          vars[varPrefix + j] = formatter.toEncoded?.(v) || v;
        }
      }
    }

    return new PreparedQuery(
      formatter.toEncoded?.(text) || text,
      vars,
      slots,
    );
  }

  function slot(...args: [name: string, defaultValue?: unknown]): Slot {
    return args.length === 1
      ? new Slot(args[0], true, { formatter })
      : new Slot(args[0], false, {
        formatter,
        defaultValue: formatter.toEncoded?.(args[1]) || args[1],
      });
  }

  // @ts-expect-error
  return Object.assign(surql, { slot });
}
