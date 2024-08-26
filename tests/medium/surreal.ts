import { type InitializedSurreal, initSurreal } from "@tai-kun/surrealdb";
import Client from "@tai-kun/surrealdb/clients/standard";
import * as dataTypes from "@tai-kun/surrealdb/data-types/standard";
import HttpEngine from "@tai-kun/surrealdb/engines/http";
import WebSocketEngine from "@tai-kun/surrealdb/engines/websocket";
import CborFormatter from "@tai-kun/surrealdb/formatters/cbor";
import JsonFormatter from "@tai-kun/surrealdb/formatters/json";
import { afterAll, beforeAll, vi } from "vitest";
import { WebSocket } from "ws";

const engines = {
  http: HttpEngine,
  websocket: WebSocketEngine,
} as const;

const formatters = {
  cbor: CborFormatter,
  json: JsonFormatter,
} as const;

export default [
  define("http", "cbor"),
  define("http", "json"),
  define("websocket", "cbor"),
  define("websocket", "json"),
];

////////////////////////////////////////////////////////////////////////////////

type Engines = keyof typeof engines;
type Formatters = keyof typeof formatters;

function define(
  eng: Engines,
  fmt: Formatters,
): InitializedSurreal<typeof Client> & {
  eng: Engines;
  fmt: Formatters;
} & {
  suite: `${Engines}_${Formatters}`;
  url(): `${"http" | "ws"}://127.0.0.1:${number}`;
} {
  let surreal: InitializedSurreal<typeof Client>;
  let formatter;

  switch (fmt) {
    case "cbor":
      formatter = new CborFormatter(dataTypes);
      break;

    case "json":
      formatter = new JsonFormatter();
      break;

    default:
      throw new Error(`unreachable: ${fmt}`);
  }

  switch (eng) {
    case "http":
      surreal = initSurreal({
        Client,
        engines: {
          http(config) {
            return new HttpEngine(config);
          },
        },
        formatter,
      });
      break;

    case "websocket":
      surreal = initSurreal({
        Client,
        engines: {
          ws(config) {
            return new WebSocketEngine({
              ...config,
              createWebSocket(addr, proto) {
                if ("WebSocket" in globalThis) {
                  return new globalThis.WebSocket(addr, proto);
                }

                return new WebSocket(addr, proto);
              },
            });
          },
        },
        formatter,
      });
      break;

    default:
      throw new Error(`unreachable: ${eng}`);
  }

  return {
    ...surreal,
    eng,
    fmt,
    suite: `${eng}_${fmt}`,
    url(): `${"http" | "ws"}://127.0.0.1:${number}` {
      return eng === "http"
        ? `http://${host()}`
        : `ws://${host()}`;
    },
  };
}

export function host(): `127.0.0.1:${number}` {
  if (typeof port !== "number") {
    throw new Error("ポート番号が確定する前にホストを取得できません。");
  }

  return `127.0.0.1:${port}`;
}

let port: number;

beforeAll(async () => {
  port = await vi.waitFor(
    async () => {
      const resp = await fetch("http://127.0.0.1:3150/surrealdb/start", {
        method: "POST",
      });

      if (!resp.ok) {
        await resp.body?.cancel();
        throw new Error(resp.statusText);
      }

      const text = await resp.text();

      return Number(text);
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
  await vi.waitFor(
    async () => {
      const resp = await fetch(`http://127.0.0.1:${port}/health`);
      await resp.body?.cancel();

      if (!resp.ok) {
        throw new Error(resp.statusText);
      }
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
}, 30e3);

afterAll(async () => {
  try {
    const resp = await fetch("http://127.0.0.1:3150/stop", {
      method: "POST",
      body: String(port),
    });
    await resp.body?.cancel();
  } catch (e) {
    console.warn(e);
  }
});
