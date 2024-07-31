import { initSurreal } from "@tai-kun/surrealdb";
import Client from "@tai-kun/surrealdb/clients/standard";
import {
  Datetime,
  Decimal,
  Duration,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Table,
  Thing,
  Uuid,
} from "@tai-kun/surrealdb/data-types/standard";
import HttpEngine from "@tai-kun/surrealdb/engines/http";
import WebSocketEngine from "@tai-kun/surrealdb/engines/websocket";
import CborFormatter from "@tai-kun/surrealdb/formatters/cbor";
import NoOpValidator from "@tai-kun/surrealdb/validators/noop";
import { beforeAll, vi } from "vitest";

export default [
  define({
    engine: "http",
    formatter: "cbor",
    validator: "noop",
    initSurreal() {
      return initSurreal({
        Client,
        engines: {
          http(config) {
            return new HttpEngine(config);
          },
        },
        validator: new NoOpValidator(),
        formatter: new CborFormatter({
          Uuid,
          Table,
          Thing,
          Decimal,
          Datetime,
          Duration,
          GeometryLine,
          GeometryPoint,
          GeometryPolygon,
          GeometryMultiLine,
          GeometryCollection,
          GeometryMultiPoint,
          GeometryMultiPolygon,
        }),
      });
    },
  }),
  define({
    engine: "websocket",
    formatter: "cbor",
    validator: "noop",
    initSurreal() {
      return initSurreal({
        Client,
        engines: {
          ws(config) {
            return new WebSocketEngine({
              ...config,
              async createWebSocket(addr, proto) {
                if ("WebSocket" in globalThis) {
                  return new globalThis.WebSocket(addr, proto);
                }

                const { WebSocket } = await import("ws");
                return new WebSocket(addr, proto);
              },
            });
          },
        },
        validator: new NoOpValidator(),
        formatter: new CborFormatter({
          Uuid,
          Table,
          Thing,
          Decimal,
          Datetime,
          Duration,
          GeometryLine,
          GeometryPoint,
          GeometryPolygon,
          GeometryMultiLine,
          GeometryCollection,
          GeometryMultiPoint,
          GeometryMultiPolygon,
        }),
      });
    },
  }),
];

////////////////////////////////////////////////////////////////////////////////

function define<
  const E extends "http" | "websocket",
  const F extends string,
  const V extends string,
  T,
>(
  def: {
    engine: E;
    formatter: F;
    validator: V;
    initSurreal(): T;
  },
): T & {
  engine: E;
  formatter: F;
  validator: V;
} & {
  suite: `${E}_${F}_${V}`;
  url(): `${"http" | "ws"}://localhost:${number}`;
} {
  return {
    ...def.initSurreal(),

    engine: def.engine,
    formatter: def.formatter,
    validator: def.validator,

    suite: `${def.engine}_${def.formatter}_${def.validator}`,
    url(): `${"http" | "ws"}://localhost:${number}` {
      if (typeof port !== "number") {
        throw new Error(
          "Cannot initialize Surreal outside of the test function.",
        );
      }

      return def.engine === "http"
        ? `http://localhost:${port}`
        : `ws://localhost:${port}`;
    },
  };
}

let port: number;

beforeAll(async () => {
  port = await vi.waitFor(
    async () => {
      const resp = await fetch("http://localhost:3150");

      if (resp.status !== 200) {
        throw new Error(resp.statusText);
      }

      const text = await resp.text();
      const port = Number(text);

      return port;
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

      if (resp.status !== 200) {
        throw new Error(resp.statusText);
      }
    },
    {
      interval: 1_000,
      timeout: 10_000,
    },
  );
});
