import type { CreateEngine } from "@tai-kun/surreal/clients";
import Engine from "./Engine";

export default (
  /**
   * HTTP で通信するクライアントエンジンを作成します。
   *
   * @param config エンジンの設定。
   * @returns クライアントエンジン。
   */
  function createHttpEngine(config) {
    return new Engine(config);
  }
) satisfies CreateEngine;
