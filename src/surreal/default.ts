import Formatter from "@tai-kun/surrealdb/cbor-formatter";
import HttpEngine from "@tai-kun/surrealdb/http-engine";
import Client from "@tai-kun/surrealdb/standard-client";
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
} from "@tai-kun/surrealdb/standard-datatypes";
import WebSocketEngine, {
  type WebSocketEngineConfig,
} from "@tai-kun/surrealdb/websocket-engine";
import { WebSocket } from "isows";
import initPool from "./init-pool";
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

const {
  Pool,
} = initPool({
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
  Pool,
  Range,
  surql,
  Surreal,
  Table,
  Thing,
  Uuid,
};
