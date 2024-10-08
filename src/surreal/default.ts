import Client from "@tai-kun/surrealdb/clients/standard";
import {
  BoundExcluded,
  BoundIncluded,
  Datetime,
  Decimal,
  Duration,
  Future,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Range,
  Table,
  Thing,
  Uuid,
} from "@tai-kun/surrealdb/data-types/standard";
import HttpEngine from "@tai-kun/surrealdb/engines/http";
import WebSocketEngine, {
  type WebSocketEngineConfig,
} from "@tai-kun/surrealdb/engines/websocket";
import Formatter from "@tai-kun/surrealdb/formatters/cbor";
import { WebSocket } from "isows";
import initSurreal from "./init-surreal";

const {
  surql,
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
      return new WebSocketEngine(
        Object.assign<
          Pick<WebSocketEngineConfig, "createWebSocket">,
          Omit<WebSocketEngineConfig, "createWebSocket">
        >({
          createWebSocket(address, protocol) {
            return new WebSocket(address, protocol);
          },
        }, config),
      );
    },
  },
  formatter: /* @__PURE__ */ new Formatter({
    Uuid,
    Range,
    Table,
    Thing,
    Future,
    Decimal,
    Datetime,
    Duration,
    GeometryLine,
    BoundExcluded,
    BoundIncluded,
    GeometryPoint,
    GeometryPolygon,
    GeometryMultiLine,
    GeometryCollection,
    GeometryMultiPoint,
    GeometryMultiPolygon,
  }),
});

export {
  BoundExcluded,
  BoundIncluded,
  Datetime,
  Decimal,
  Duration,
  Future,
  GeometryCollection,
  GeometryLine,
  GeometryMultiLine,
  GeometryMultiPoint,
  GeometryMultiPolygon,
  GeometryPoint,
  GeometryPolygon,
  Range,
  surql,
  Surreal,
  Table,
  Thing,
  Uuid,
};
