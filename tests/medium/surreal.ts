import { initSurreal } from "@tai-kun/surreal";
import Client from "@tai-kun/surreal/clients/full";
import {
  createHttpEngine,
  createWebSocketEngine,
} from "@tai-kun/surreal/engines";
import {
  createCborFormatter,
  jsonFormatter,
} from "@tai-kun/surreal/formatters";
import { emptyValidator, zodValidator } from "@tai-kun/surreal/validators";
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
} from "@tai-kun/surreal/values/full";
import { ready } from "@tools/surrealdb";

const cborFormatter = createCborFormatter({
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
});

export default Object.assign([
  {
    engine: "http" as const,
    formatter: "json" as const,
    validator: "empty" as const,
    initSurreal: async function httpJsonEmpty() {
      const endpoint = await ready;
      const surreal = initSurreal({
        Client,
        engines: {
          http: createHttpEngine,
        },
        formatter: jsonFormatter,
        validator: emptyValidator,
      });

      return {
        endpoint: `http://${endpoint.host}`,
        ...surreal,
      };
    },
  },
  {
    engine: "http" as const,
    formatter: "json" as const,
    validator: "zod" as const,
    initSurreal: async function httpJsonZod() {
      const endpoint = await ready;
      const surreal = initSurreal({
        Client,
        engines: {
          http: createHttpEngine,
        },
        formatter: jsonFormatter,
        validator: zodValidator,
      });

      return {
        endpoint: `http://${endpoint.host}`,
        ...surreal,
      };
    },
  },
  {
    engine: "http" as const,
    formatter: "cbor" as const,
    validator: "empty" as const,
    initSurreal: async function httpCborEmpty() {
      const endpoint = await ready;
      const surreal = initSurreal({
        Client,
        engines: {
          http: createHttpEngine,
        },
        formatter: cborFormatter,
        validator: emptyValidator,
      });

      return {
        endpoint: `http://${endpoint.host}`,
        ...surreal,
      };
    },
  },
  {
    engine: "http" as const,
    formatter: "cbor" as const,
    validator: "zod" as const,
    initSurreal: async function httpCborZod() {
      const endpoint = await ready;
      const surreal = initSurreal({
        Client,
        engines: {
          http: createHttpEngine,
        },
        formatter: cborFormatter,
        validator: zodValidator,
      });

      return {
        endpoint: `http://${endpoint.host}`,
        ...surreal,
      };
    },
  },
  {
    engine: "ws" as const,
    formatter: "json" as const,
    validator: "empty" as const,
    initSurreal: async function wsJsonEmpty() {
      const endpoint = await ready;
      const surreal = initSurreal({
        Client,
        engines: {
          ws: createWebSocketEngine,
        },
        formatter: jsonFormatter,
        validator: emptyValidator,
      });

      return {
        endpoint: `ws://${endpoint.host}`,
        ...surreal,
      };
    },
  },
  {
    engine: "ws" as const,
    formatter: "json" as const,
    validator: "zod" as const,
    initSurreal: async function wsJsonZod() {
      const endpoint = await ready;
      const surreal = initSurreal({
        Client,
        engines: {
          ws: createWebSocketEngine,
        },
        formatter: jsonFormatter,
        validator: zodValidator,
      });

      return {
        endpoint: `ws://${endpoint.host}`,
        ...surreal,
      };
    },
  },
  {
    engine: "ws" as const,
    formatter: "cbor" as const,
    validator: "empty" as const,
    initSurreal: async function wsJsonEmpty() {
      const endpoint = await ready;
      const surreal = initSurreal({
        Client,
        engines: {
          ws: createWebSocketEngine,
        },
        formatter: cborFormatter,
        validator: emptyValidator,
      });

      return {
        endpoint: `ws://${endpoint.host}`,
        ...surreal,
      };
    },
  },
  {
    engine: "ws" as const,
    formatter: "cbor" as const,
    validator: "zod" as const,
    initSurreal: async function wsJsonZod() {
      const endpoint = await ready;
      const surreal = initSurreal({
        Client,
        engines: {
          ws: createWebSocketEngine,
        },
        formatter: cborFormatter,
        validator: zodValidator,
      });

      return {
        endpoint: `ws://${endpoint.host}`,
        ...surreal,
      };
    },
  },
], { ready });
