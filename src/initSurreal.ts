import type { Constructor } from "type-fest";
import type { ClientAbc, ClientConfig } from "./clients";

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
 * Surreal を初期化する。
 *
 * @template T - クライアントのコンストラクターの型。
 * @param init - Surreal の初期化設定。
 * @returns Surreal クラス。
 */
export default function initSurreal<T extends ClientConstructor>(
  init: SurrealInit<T>,
) {
  const {
    Client,
    engines,
    Formatter,
    Validator,
  } = init;

  // @ts-ignore
  return class Surreal extends Client {
    constructor() {
      super({
        engines,
        Formatter,
        Validator,
      });
    }
  };
}
