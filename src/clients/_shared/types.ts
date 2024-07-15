import type { EngineAbc, EngineAbcConfig } from "@tai-kun/surreal/engines";
import type { Formatter } from "@tai-kun/surreal/formatters";
import type { Validator } from "@tai-kun/surreal/validators";
import type { Promisable } from "type-fest";

/**
 * クライアントエンジンを作成する関数。
 */
export interface CreateEngine {
  /**
   * クライアントエンジンを作成します。
   *
   * @param config エンジンの設定。
   * @returns クライアントエンジン。
   */
  (config: EngineAbcConfig): Promisable<EngineAbc>;
}

/**
 * クライアントエンジンのマッピング。
 *
 * エンジンのプロトコルをキーとし、エンジンを作成する関数またはエンジンのプロトコルを値とします。
 * プロトコルは例えば `http` や `ws` など `://` の前にくる文字列です。
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
   * クライアントとサーバー間で伝送されるデータのエンコーダーとデコーダー。
   */
  readonly formatter: Formatter;
  /**
   * 各種データの検証を行うバリデータ-。
   */
  readonly validator: Validator;
}

/**
 * クライアントの接続オプション。
 */
export interface ClientConnectOptions {
  /**
   * 接続の中断に使用するシグナル。
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * サーバーとの接続を切断する際のオプション。
 */
export interface ClientDisconnectOptions {
  /**
   * サーバーとの接続を強制的に切断するかどうか。
   * true にすると、実行中のタスクに対して中止シグナルが送信されます。
   */
  readonly force?: boolean | undefined;
  /**
   * 切断の中断に使用するシグナル。
   */
  readonly signal?: AbortSignal | undefined;
}

/**
 * RPC リクエストのオプション。
 */
export interface ClientRpcOptions {
  /**
   * リクエストの中断に使用するシグナル。
   */
  readonly signal?: AbortSignal | undefined;
}
