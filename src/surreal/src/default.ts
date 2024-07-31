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
import Formatter from "@tai-kun/surrealdb/formatters/cbor";
import Validator from "@tai-kun/surrealdb/validators/noop";
import initSurreal from "./init-surreal";

const {
  Surreal,
} = /* @__PURE__ */ initSurreal({
  Client,
  engines: {
    https: "http",
    wss: "ws",
    http(config) {
      return new HttpEngine(config);
    },
    ws(config) {
      return new WebSocketEngine({
        ...config,
        async createWebSocket(address, protocol) {
          if ("process" in globalThis && "WebSocket" in globalThis) {
            const undiciVersion = process.versions["undici"];

            if (
              typeof undiciVersion === "string"
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
              return new globalThis.WebSocket(address, protocol);
            }
          } else if ("WebSocket" in globalThis) {
            return new globalThis.WebSocket(address, protocol);
          }

          const { WebSocket } = await import("ws");
          return new WebSocket(address, protocol);
        },
      });
    },
  },
  validator: /* @__PURE__ */ new Validator(),
  formatter: /* @__PURE__ */ new Formatter({
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

export {
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
  Surreal,
  Table,
  Thing,
  Uuid,
};
