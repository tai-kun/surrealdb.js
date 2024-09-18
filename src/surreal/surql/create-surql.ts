import { SurrealValueError } from "@tai-kun/surrealdb/errors";
import type { Formatter } from "@tai-kun/surrealdb/formatter";
import PreparedQuery from "./prepared-query";
import Raw, { type RawValue } from "./raw";
import Slot from "./slot";

export interface Surql {
  <TValue extends unknown[] = unknown[]>(
    texts: readonly string[] | TemplateStringsArray,
    ...values: TValue
  ): PreparedQuery<Extract<TValue[number], Slot>>;
  raw: {
    (value: RawValue): Raw;
  };
  slot: {
    <const TName extends string, TValue>(
      name: TName,
    ): Slot<TName, true, TValue | undefined>;
    <const TName extends string, TValue>(
      name: TName,
      defaultValue: TValue,
    ): Slot<TName, false, TValue>;
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
      throw new SurrealValueError(
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
            throw new SurrealValueError(
              `a variable name that do not start with "${varPrefix}"`,
              v.name,
            );
          }

          slots.push(v);
          named.push(v.name);
        }
      } else if (v instanceof Raw) {
        text += v.toString();
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

  function raw(value: RawValue): Raw {
    return new Raw(value);
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
  return Object.assign(surql, { raw, slot });
}
