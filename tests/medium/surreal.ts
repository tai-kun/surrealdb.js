import { type InitializedSurreal, initSurreal } from "@tai-kun/surrealdb";
import Client from "@tai-kun/surrealdb/clients/standard";
import * as dataTypes from "@tai-kun/surrealdb/data-types/standard";
import HttpEngine from "@tai-kun/surrealdb/engines/http";
import WebSocketEngine from "@tai-kun/surrealdb/engines/websocket";
import CborFormatter from "@tai-kun/surrealdb/formatters/cbor";
import JsonFormatter from "@tai-kun/surrealdb/formatters/json";
import NoOpValidator from "@tai-kun/surrealdb/validators/noop";
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

const validators = {
  noop: NoOpValidator,
} as const;

export default [
  define("http", "cbor", "noop"),
  define("http", "json", "noop"),
  define("websocket", "cbor", "noop"),
  define("websocket", "json", "noop"),
];

////////////////////////////////////////////////////////////////////////////////

type Engines = keyof typeof engines;
type Formatters = keyof typeof formatters;
type Validators = keyof typeof validators;

function define(
  eng: Engines,
  fmt: Formatters,
  v8n: Validators,
): InitializedSurreal<typeof Client> & {
  eng: Engines;
  fmt: Formatters;
  v8n: Validators;
} & {
  suite: `${Engines}_${Formatters}_${Validators}`;
  url(): `${"http" | "ws"}://localhost:${number}`;
} {
  let surreal: InitializedSurreal<typeof Client>;
  let formatter;
  let validator;

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

  switch (v8n) {
    case "noop":
      validator = new NoOpValidator();
      break;

    default:
      throw new Error(`unreachable: ${v8n}`);
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
        validator,
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
        validator,
      });
      break;

    default:
      throw new Error(`unreachable: ${eng}`);
  }

  return {
    ...surreal,
    eng,
    fmt,
    v8n,
    suite: `${eng}_${fmt}_${v8n}`,
    url(): `${"http" | "ws"}://localhost:${number}` {
      if (typeof port !== "number") {
        throw new Error(
          "Cannot initialize Surreal outside of the test function.",
        );
      }

      return eng === "http"
        ? `http://localhost:${port}`
        : `ws://localhost:${port}`;
    },
  };
}

let port: number;

beforeAll(async () => {
  port = await vi.waitFor(
    async () => {
      const resp = await fetch("http://localhost:3150/surrealdb/start", {
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
      const resp = await fetch(`http://localhost:${port}/health`);
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
    const resp = await fetch("http://localhost:3150/stop", {
      method: "POST",
      body: String(port),
    });
    await resp.body?.cancel();
  } catch (e) {
    console.warn(e);
  }
});
