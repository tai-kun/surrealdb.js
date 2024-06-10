import type { Constructor } from "type-fest";
import type { ClientConfig, default as ClientAbc } from "./models/ClientAbc";

type ClientConstructor = Constructor<
  any,
  ConstructorParameters<typeof ClientAbc>
>;

/**
 * Surreal の初期化設定。
 *
 * @template T - クライアントのコンストラクターの型。
 */
export interface SurrealInit<T extends ClientConstructor = ClientConstructor>
  extends ClientConfig
{
  /**
   * クライアントのコンストラクター。
   */
  readonly Client: T;
}

/**
 * Surreal クラス。
 *
 * @template T - クライアントのコンストラクターの型。
 */
export interface Surreal<T extends ClientConstructor> {
  new(): InstanceType<T> & AsyncDisposable;
}

/**
 * Surreal を初期化する。
 *
 * @template T - クライアントのコンストラクターの型。
 * @param init - Surreal の初期化設定。
 * @returns Surreal クラス。
 */
export default function initSurreal<T extends ClientConstructor>(
  init: SurrealInit<T>,
): {
  Surreal: Surreal<T>;
} {
  const {
    Client,
    engines,
    Formatter,
    Validator,
  } = init;

  // @ts-ignore
  class SurrealClass extends Client {
    constructor() {
      super({
        engines,
        Formatter,
        Validator,
      });
    }

    async [Symbol.asyncDispose || Symbol.for("Symbol.asyncDispose")]() {
      await (this as unknown as ClientAbc).disconnect();
    }
  }

  return {
    // @ts-ignore
    Surreal: SurrealClass,
  };
}
