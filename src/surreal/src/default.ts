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
      return new WebSocketEngine({
        ...config,
        createWebSocket(address, protocol) {
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
  surql,
  Surreal,
  Table,
  Thing,
  Uuid,
};
