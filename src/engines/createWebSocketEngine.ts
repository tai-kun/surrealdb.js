import type { CreateEngine } from "~/models/_client/Abc";
import WebSocketEngine from "./WebSocketEngine";

export default (
  /**
   * WebSocket で通信するクライアントエンジンを作成します。
   * 使用する WebSocket クラスは次に示す基準で選択されます:
   *
   * - Node.js で実行されている場合:
   *     - undici のバージョンが 6.18.0 以上の場合、グローバルオブジェクトの WebSocket を使用します。
   *     - undici のバージョンが 6.18.0 未満の場合、ws パッケージを動的インポートして WebSocket を使用します。
   * - Node.js でない環境で実行されている場合:
   *     - グローバルオブジェクトの WebSocket を使用します。
   *     - グローバルオブジェクトに WebSocket が存在しない場合、ws パッケージを動的インポートして WebSocket を使用します。
   *
   * @param config エンジンの設定。
   * @returns クライアントエンジン。
   */
  function webSocketEngine(config) {
    return new WebSocketEngine({
      ...config,
      async createWebSocket(address, protocol) {
        if ("process" in globalThis) {
          const undiciVersion = process.versions["undici"];

          if (
            "WebSocket" in globalThis
            && typeof undiciVersion === "string"
            && undiciVersion
              .split(".")
              .map(p => parseInt(p, 10))
              .every((p, i, { length }) =>
                length === 3 && (
                  // undici v6.18.0 未満はフレーム解析に関するバグがあるため、利用しない。
                  (i === 0 && p >= 6)
                  || (i === 1 && p >= 18)
                  || (i === 2 && p >= 0)
                )
              )
          ) {
            return new WebSocket(address, protocol);
          }

          return await import("ws")
            .then(({ WebSocket }) => new WebSocket(address, protocol));
        }

        if ("WebSocket" in globalThis) {
          return new WebSocket(address, protocol);
        }

        return await import("ws")
          .then(({ WebSocket }) => new WebSocket(address, protocol));
      },
    });
  }
) satisfies CreateEngine;
