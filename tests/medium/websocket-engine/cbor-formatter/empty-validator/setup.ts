import { ready } from "@tools/surrealdb";
import { initSurreal } from "surrealjs";
import { webSocketEngine } from "surrealjs/engines";
import { CborFormatter } from "surrealjs/formatters";
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
} from "surrealjs/full";
import { EmptyValidator } from "surrealjs/validators";

class Formatter extends CborFormatter {
  constructor() {
    super({
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
  }
}

async function getInitializedSurreal() {
  const endpoint = await ready;
  const surreal = initSurreal({
    Client,
    engines: {
      ws: webSocketEngine,
    },
    Formatter,
    Validator: EmptyValidator,
  });

  return {
    endpoint: `ws://${endpoint.host}`,
    ...surreal,
  };
}

Object.assign(globalThis, { getInitializedSurreal });
