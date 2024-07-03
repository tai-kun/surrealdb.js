import type { CreateEngine } from "~/clients/_lib/Abc";
import HttpEngine from "./_lib/HttpEngine";

export default (
  /**
   * HTTP で通信するクライアントエンジンを作成します。
   *
   * @param config エンジンの設定。
   * @returns クライアントエンジン。
   */
  function createHttpEngine(config) {
    return new HttpEngine(config);
  }
) satisfies CreateEngine;
