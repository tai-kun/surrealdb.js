import { initSurreal } from "@tai-kun/surreal";
import {
  createHttpEngine,
  createWebSocketEngine,
} from "@tai-kun/surreal/engines";
import {
  createCborFormatter,
  jsonFormatter,
} from "@tai-kun/surreal/formatters";
import {
  Client,
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
} from "@tai-kun/surreal/full";
import { EmptyValidator, ZodValidator } from "@tai-kun/surreal/validators";
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
        Validator: EmptyValidator,
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
        Validator: ZodValidator,
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
        Validator: EmptyValidator,
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
        Validator: ZodValidator,
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
        Validator: EmptyValidator,
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
        Validator: ZodValidator,
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
        Validator: EmptyValidator,
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
        Validator: ZodValidator,
      });

      return {
        endpoint: `ws://${endpoint.host}`,
        ...surreal,
      };
    },
  },
], { ready });
