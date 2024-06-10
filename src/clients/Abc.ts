import type { Constructor, Promisable } from "type-fest";
import type { EngineAbc } from "../engines";
import { CircularEngineReference, UnsupportedProtocol } from "../errors";
import type { FormatterAbc } from "../formatters";
import type { ValidatorAbc } from "../validators";

/**
 * クライアントエンジンを作成する関数。
 */
export interface CreateEngine {
  /**
   * クライアントエンジンを作成する。
   *
   * @param config - エンジンの設定。
   * @returns クライアントエンジン。
   */
  (...args: ConstructorParameters<typeof EngineAbc>): Promisable<EngineAbc>;
}

/**
 * クライアントエンジンのマッピング。
 *
 * エンジンのプロトコルをキーとし、エンジンを作成する関数またはエンジンのプロトコルを値とする。
 * プロトコルは例えば `http` や `ws` など `://` の前にくる文字列である。
 */
export type ClientEngines = {
  readonly [P in string]?: CreateEngine | string | undefined;
};

/**
 * クライアントの設定。
 */
export interface ClientConfig {
  /**
   * クライアントエンジンのマッピング。
   */
  readonly engines: ClientEngines;
  /**
   * クライアントとサーバー間で伝送されるデータのシリアライザーとデシリアライザー。
   */
  readonly Formatter: Constructor<
    FormatterAbc,
    ConstructorParameters<typeof FormatterAbc>
  >;
  /**
   * 各種データの検証を行うバリデータ-。
   */
  readonly Validator: Constructor<
    ValidatorAbc,
    ConstructorParameters<typeof ValidatorAbc>
  >;
}

/**
 * クライアントの抽象クラス。
 */
export default abstract class ClientAbc {
  #engines: ClientEngines;

  /**
   * クライアントとサーバー間で伝送されるデータのシリアライザーとデシリアライザー。
   */
  protected readonly formatter: FormatterAbc;

  /**
   * 各種データの検証を行うバリデータ-。
   */
  protected readonly validator: ValidatorAbc;

  /**
   * クライアントを作成する。
   *
   * @param config - クライアントの設定。
   */
  constructor(config: ClientConfig) {
    const {
      engines,
      Formatter,
      Validator,
    } = config;
    this.#engines = { ...engines }; // Shallow copy
    this.formatter = new Formatter();
    this.validator = new Validator();
  }

  /**
   * クライアントエンジンを取得する。
   *
   * @param protocol - 接続を試みるエンドポイントのプロトコル。
   * @returns クライアントエンジンを作成する関数。
   */
  protected async getEngine(protocol: string): Promise<CreateEngine> {
    let engine = this.#engines[protocol];
    const seen: string[] = [];

    while (typeof engine === "string") {
      if (seen.includes(engine)) {
        throw new CircularEngineReference(seen);
      }

      seen.push(engine);
      engine = this.#engines[engine];
    }

    if (!engine) {
      throw new UnsupportedProtocol(protocol);
    }

    return engine;
  }
}
