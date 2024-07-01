import type { CreateEngine } from "~/models/_client/Abc";
import HttpEngine from "./HttpEngine";

export default (
  /**
   * HTTP で通信するクライアントエンジンを作成します。
   *
   * @param config エンジンの設定。
   * @returns クライアントエンジン。
   */
  function httpEngine(config) {
    return new HttpEngine(config);
  }
) satisfies CreateEngine;
