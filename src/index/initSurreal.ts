import type { Constructor } from "type-fest";
import type { ClientConfig, default as ClientAbc } from "~/clients/_lib/Abc";
import { SurrealTypeError, unreachable } from "~/errors";
import type { RecordData } from "./types";

type ClientConstructor = Constructor<
  any,
  ConstructorParameters<typeof ClientAbc>
>;

/**
 * SurrealQL の初期化設定。
 */
export interface SurqlInit {
  /**
   * 変数のプレフィックス。
   *
   * @default "__js_tagged_"
   */
  readonly prefix?: string | undefined;
}

/**
 * Surreal の初期化設定。
 *
 * @template T クライアントのコンストラクターの型。
 */
export interface SurrealInit<T extends ClientConstructor = ClientConstructor>
  extends ClientConfig
{
  /**
   * クライアントのコンストラクター。
   */
  readonly Client: T;
  /**
   * SurrealQL の初期化設定。
   */
  readonly surql?: SurqlInit | undefined;
}

/**
 * Surreal クラス。
 *
 * @template T クライアントのコンストラクターの型。
 */
export interface Surreal<T extends ClientConstructor> {
  new(): InstanceType<T> & AsyncDisposable;
}

export type RawSurql =
  | string
  | number
  | bigint
  | boolean
  | { readonly toSurql: () => string };

class Raw<T extends RawSurql = RawSurql> {
  constructor(public readonly value: T) {}
}

function raw<T extends RawSurql>(value: T): Raw<T> {
  return new Raw<T>(value);
}

/**
 * Surreal を初期化する。
 *
 * @template T クライアントのコンストラクターの型。
 * @param init Surreal の初期化設定。
 * @returns Surreal クラス。
 */
export default function initSurreal<T extends ClientConstructor>(
  init: SurrealInit<T>,
): {
  Surreal: Surreal<T>;
  Surql: {
    new<T extends readonly unknown[] = unknown[]>(
      text: string,
      vars: RecordData,
    ): {
      readonly __type: T;
      readonly text: string;
      readonly vars: RecordData;
    };
  };
  surql: {
    <T extends readonly unknown[] = unknown[]>(
      texts: readonly string[] | TemplateStringsArray,
      ...values: unknown[]
    ): {
      readonly __type: T;
      readonly text: string;
      readonly vars: RecordData;
    };
    readonly raw: {
      <T extends RawSurql>(value: T): {
        readonly value: T;
      };
    };
  };
} {
  const {
    surql: { prefix = "__js_tagged_" } = {},
    Client,
    engines,
    formatter,
    validator,
  } = init;

  if (!/^[0-9a-z_]*$/i.test(prefix)) {
    throw new SurrealTypeError(`Invalid prefix: ${prefix}`);
  }

  // @ts-ignore
  class SurrealClass extends Client {
    constructor() {
      super({
        engines,
        formatter,
        validator,
      });
    }

    async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]() {
      await (this as unknown as ClientAbc).disconnect();
    }
  }

  class Surql<T extends readonly unknown[] = unknown[]> {
    /**
     * @deprecated この値は存在しません。型推論のためにのみ使用されます。
     */
    // @ts-expect-error
    readonly __type: T;

    readonly #text: string;

    readonly #vars: RecordData;

    constructor(text: string, vars: RecordData) {
      this.#text = text;
      this.#vars = vars;
    }

    get text() {
      return this.#text;
    }

    get vars() {
      return this.#vars;
    }
  }

  function surql<T extends readonly unknown[] = unknown[]>(
    texts: readonly string[] | TemplateStringsArray,
    ...values: unknown[]
  ): Surql<T> {
    let text = "";
    const vars: Record<string, unknown> = {};

    for (let i = 0, j: number, len = texts.length; i < len; i++) {
      text += texts[i];

      if (i in values) {
        if (values[i] instanceof Raw) {
          const { value: x } = values[i] as Raw;

          switch (typeof x) {
            case "string":
            case "bigint":
              text += x;
              break;

            case "number":
              // Number.MAX_VALUE などを許容するため、Number.isFinite で十分。
              if (!Number.isFinite(x)) {
                throw new SurrealTypeError(
                  "The number `" + x + "` is not finite.",
                );
              }

              text += x;
              break;

            // case "bigint":
            //   text += x;
            //   break;

            case "object":
              if (x === null || typeof x.toSurql !== "function") {
                throw new SurrealTypeError("Unexpected object: " + String(x));
              }

              text += x.toSurql();
              break;

            case "boolean":
              text += x && "true" || "false";
              break;

            case "symbol":
            case "function":
            case "undefined":
              throw new SurrealTypeError("Unexpected type: " + typeof x);

            default:
              unreachable();
          }
        } else {
          j = values.indexOf(values[i]);

          if (j === -1) {
            j = i;
          }

          text += "$" + prefix + j;
          vars[prefix + j] = values[j];
        }
      }
    }

    return new Surql<T>(text, vars);
  }

  return {
    // @ts-ignore
    Surreal: SurrealClass,
    Surql,
    surql: Object.assign(surql, { raw }),
  };
}
