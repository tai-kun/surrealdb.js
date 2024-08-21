import { autoReconnect, initSurreal } from "@tai-kun/surrealdb";
import Client from "@tai-kun/surrealdb/clients/standard";
import { CONNECTING } from "@tai-kun/surrealdb/engine";
import WebSocketEngine from "@tai-kun/surrealdb/engines/websocket";
import JsonFormatter from "@tai-kun/surrealdb/formatters/json";
import { channel } from "@tai-kun/surrealdb/utils";
import NoOpValidator from "@tai-kun/surrealdb/validators/noop";
import { WebSocket } from "isows";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { stopSurrealDb, viWaitForSurrealDb } from "../../surrealdb";

let port: number;
let pingInterval: number;
let Surreal: ReturnType<typeof initSurreal<typeof Client>>["Surreal"];

beforeEach(async () => {
  port = await viWaitForSurrealDb();
  pingInterval = 3_000;
  ({ Surreal } = initSurreal({
    Client: Client,
    engines: {
      ws(config) {
        return new WebSocketEngine({
          ...config,
          pingInterval: () => pingInterval,
          createWebSocket(address, protocol) {
            return new WebSocket(address, protocol);
          },
        });
      },
    },
    formatter: new JsonFormatter(),
    validator: new NoOpValidator(),
    disableDefaultErrorHandler: true,
  }));
});

afterEach(async () => {
  await stopSurrealDb(port);
});

test("再接続", { timeout: 60_000 }, async () => {
  await using db = new Surreal();
  const ar = autoReconnect(db);
  await db.connect(`ws://127.0.0.1:${port}`);
  const lockdown = () => {
    const unsubscribe = channel.subscribe("websocket:pong", () => {
      throw null; // ping の応答を失敗させる。
    });
    const blocker = () => {
      throw null; // 接続させない。
    };
    db.on(CONNECTING, blocker);

    return () => {
      unsubscribe();
      db.off(CONNECTING, blocker);
    };
  };
  const events: string[] = [];
  ar.on("success", () => (events.push("success"), void 0));
  ar.on("failure", () => (events.push("failure"), void 0));

  {
    // ping が定期的に送受信されていることを確認する。
    {
      const pingCb = vi.fn();
      const pongCb = vi.fn();

      channel.subscribe("websocket:ping", pingCb);
      channel.subscribe("websocket:pong", pongCb);

      await vi.waitUntil(() => pingCb.mock.calls.length > 0, { timeout: 10e3 });
      await vi.waitUntil(() => pongCb.mock.calls.length > 0, { timeout: 10e3 });
    }

    // 初期状態
    {
      expect(ar.enabled);
      expect(ar.getReconnectionInfo()).toStrictEqual({
        state: "waiting",
        phase: "waiting",
      });
    }

    const openup = lockdown(); // ping を不能にする。

    // 再接続に失敗する。
    {
      await vi.waitUntil(() => ar.state === "failure", { timeout: 20e3 });

      expect(ar.getReconnectionInfo()).toStrictEqual({
        state: "failure",
        phase: "pending",
      });
    }

    openup(); // 再度接続可能にする。

    // 再接続に成功する。
    {
      await vi.waitUntil(() => ar.state === "success", { timeout: 20e3 });

      expect(ar.getReconnectionInfo()).toStrictEqual({
        state: "success",
        phase: "succeeded",
      });
    }

    {
      await ar.idle();

      expect(events.indexOf("error")).toBeLessThan(events.indexOf("success"));
    }
  }
});
