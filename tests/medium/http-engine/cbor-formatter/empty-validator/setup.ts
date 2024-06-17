import { initSurreal } from "@tai-kun/surrealdb";
import { httpEngine } from "@tai-kun/surrealdb/engines";
import { CborFormatter } from "@tai-kun/surrealdb/formatters";
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
} from "@tai-kun/surrealdb/full";
import { EmptyValidator } from "@tai-kun/surrealdb/validators";
import { ready } from "@tools/surrealdb";

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
      http: httpEngine,
    },
    Formatter,
    Validator: EmptyValidator,
  });

  return {
    endpoint: `http://${endpoint.host}`,
    ...surreal,
  };
}

Object.assign(globalThis, { getInitializedSurreal });
